
import { Secrets, ZambdaInput } from 'ottehr-utils';


export interface CreateStripeCustomerRequestParams {
  email: string,
  phone:string,
  firstName: string,
  lastName: string,
  dob: string,
  patientId: string
}

export interface CreateStripeCustomerResponse {
  customer: object
}

export function validateRequestParameters(input: ZambdaInput): CreateStripeCustomerRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      email,
      firstName,
      lastName,
      phone,
      dob,
      patientId
    } = JSON.parse(input.body);

  return {
    patientId: patientId,
    email: email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    dob: dob || null,
    secrets: input.secrets,
  };
}
