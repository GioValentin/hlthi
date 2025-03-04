//@ts-nocheck
import { APIGatewayProxyResult } from 'aws-lambda';

import {
  SecretsKeys,
  ZambdaInput,
  getSecret,
  CreateAccountPhoneVerificationResponse,
  Account
} from 'ottehr-utils';
import { validateCreateAccountParams } from './validateRequestParameters';
import { Patient } from 'fhir/r4';
import { getM2MClientToken } from '../../shared';
import Stripe from 'stripe'
import axios from 'axios';

// Lifting up value to outside of the handler allows it to stay in memory across warm lambda invocations
let zapehrToken: string;

const formatPhoneNumber = function(phone: string) {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Ensure it's a valid 10-digit US number
  if (digits.length === 10) {
      return `+1${digits}`;
  } else {
      throw new Error("Invalid phone number format");
  }
}

const enum RoleType {
  Patient = 'Patient',
  Inactive = 'Inactive',
  Manager = 'Manager',
  FrontDesk = 'FrontDesk',
  Staff = 'Staff',
  Provider = 'Provider',
  Prescriber = 'Prescriber',
  Administrator = 'Administrator',
}


const getPatientUserRoles = async (projectApiUrl: string, accessToken: string, projectId: string): Promise<{ id: string }> => {
  console.log('Updating user roles.');

  const zambdaRule = {
    resource: ['Zambda:Function:*'],
    action: ['Zambda:InvokeFunction'],
    effect: 'Allow',
  };

  const roles = [
    { name: RoleType.Patient },
  ];

  const httpHeaders = {
    accept: 'application/json',
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
    'x-zapehr-project-id': `${projectId}`,
  };

  console.log('searching for existing roles for the project');
  const existingRolesResponse = await fetch(`${projectApiUrl}/iam/role`, {
    method: 'GET',
    headers: httpHeaders,
  });
  const existingRoles = await existingRolesResponse.json();
  console.log('existingRoles: ', existingRoles);
  if (!existingRolesResponse.ok) {
    throw new Error('Error searching for existing roles');
  }

  let adminUserRole = undefined;

  for (const role of roles) {
    const roleName = role.name;
    let foundRole;
    if (existingRoles.length > 0) {
      foundRole = existingRoles.find((existingRole: any) => existingRole.name === roleName);
    }


    if (foundRole.name === RoleType.Patient) {
      adminUserRole = foundRole;
    }
  }

  console.group(`Setting defaultSSOUserRole for project to Patient user role ${adminUserRole.id}`);
  // const endpoint = `${projectApiUrl}/project`;
  // const response = await fetch(endpoint, {
  //   method: 'PATCH',
  //   headers: httpHeaders,
  //   body: JSON.stringify({ defaultSSOUserRoleId: adminUserRole.id }),
  // });
  // const responseJSON = await response.json();
  // console.log('response', responseJSON);
  // if (!response.ok) {
    // throw new Error(`Failed to set defaultSSOUserRole`);
  // }

  return adminUserRole;
};

const inviteUser = async function(
  projectApiUrl: string,
  email: string,
  applicationId: string,
  accessToken: string,
  projectId: string,
  account: Account
): Promise<string> {
  const defaultRole = await getPatientUserRoles(projectApiUrl, accessToken, projectId);
  if(account.firstName == undefined || account.phone == undefined) {
    throw new Error("Missing Account Details");
  }

  let lines = [];

  if(account.address?.addressLine1 != undefined ) {
    lines.push(account.address?.addressLine1);
  }

  if(account.address?.addressLine2 != undefined && account.address?.addressLine2 != '') {
    lines.push(account.address?.addressLine2);
  }

  const patient: Patient = {
    resourceType: 'Patient',
    active: true,   
    name: [{ family: account.lastName, given: [account.firstName] }],
    gender: account.sex == undefined ? 'unknown' : account.sex,
    telecom: [
      {
        system: 'email',
        value: account.email,
      },
      {
        use: 'mobile',
        value: account.phone,
        system: "sms"
      }

    ],
    birthDate: account.dateOfBirth,
    address: [
      {
        line: lines,
        city: account.address?.city,
        state: account.address?.state,
        postalCode: account.address?.postal,
        country: 'United States'
      }
    ],
    contact: [
      {
        name: {
          use: 'usual',
          given: [
            account.firstName
          ],
          family: account.lastName
        },
        telecom: [
          {
            use: "mobile",
            rank: 1,
            value: account.phone,
            system: 'phone'
          }
        ],
        relationship: [
          {
            coding: [
              {
                code: 'BP',
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                display: 'Billing contact person'
              }
            ]
          }
        ]
      }
    ],
    extension: [
      {
        url: 'https://fhir.zapehr.com/r4/StructureDefinitions/form-user',
        valueString: 'Patient'
      },
      {
        url: "https://fhir.zapehr.com/r4/StructureDefinitions/point-of-discovery",
        valueString: "Friend/Family"
      }
    ]
  };

  console.log(applicationId);

  const invitedUserResponse = await fetch(`${projectApiUrl}/user/invite`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'x-zapehr-project-id': `${projectId}`,
    },
    body: JSON.stringify({
      username: formatPhoneNumber(account.phone),
      phone: formatPhoneNumber(account.phone),
      email: email,
      applicationId: applicationId,
      resource: patient,
      roles: [
        defaultRole.id
      ]
    }),
  });


  if (!invitedUserResponse.ok) {
    const r = await invitedUserResponse.json();

    if(r.code == 4004) {
      throw new Error('User already exists');
    } 

    throw new Error(JSON.stringify(r));
    
  }

  const invitedUser = await invitedUserResponse.json();
  return invitedUser;
  
}

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  
  try {
    const validatedParameters = validateCreateAccountParams(input);
    const { secrets } = validatedParameters;
    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));
    const websiteUrl = getSecret(SecretsKeys.WEBSITE_URL, secrets);
    
    console.groupEnd();
    console.debug('validateRequestParameters success');

    if (!zapehrToken) {
      console.log('getting token');
      zapehrToken = await getM2MClientToken(secrets);
    } else {
      console.log('already have token');
    }

    const response = {
      invitedUser: {},
      customer: {} as Stripe.Customer,
      subscription: {} as Stripe.Subscription
    }

    const invitedUser = await inviteUser(
      getSecret(SecretsKeys.PROJECT_API, secrets),
      validatedParameters.account.email ? validatedParameters.account.email : 'noEmail',
      getSecret(SecretsKeys.APPLICATION_ID, secrets),
      zapehrToken,
      getSecret(SecretsKeys.PROJECT_ID, secrets),
      validatedParameters.account
    );

    if(!validatedParameters.account.phone) {
      throw new Error("Missing phone");
    }

    //@ts-ignore
    const customer = await stripe.customers.create({
      name: validatedParameters.account.firstName + ' ' + validatedParameters.account.lastName,
      email: validatedParameters.account.email,
      phone: formatPhoneNumber(validatedParameters.account.phone),
      address: {
        line1: validatedParameters.account.address?.addressLine1,
        line2: validatedParameters.account.address?.addressLine2 ? validatedParameters.account.address?.addressLine2 : '',
        city: validatedParameters.account.address?.city,
        postal_code: validatedParameters.account.address?.postal,
        state: validatedParameters.account.address?.state,
        country: 'us'
      },
      metadata: {
        "patient_FHIR": invitedUser.profile,
        "date_of_birth": validatedParameters.account.dateOfBirth,
        "ehr_user_id": invitedUser.id,
        "sub": invitedUser.id
      }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: getSecret(SecretsKeys.STRIPE_DEFAULT_PRICE_ID, secrets),
        },
      ],
    });

    response.customer = customer as Stripe.Customer;
    response.invitedUser = invitedUser;
    response.subscription = subscription as Stripe.Subscription;

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };

  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' }),
    };
  }
};