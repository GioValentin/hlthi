import { APIGatewayProxyResult } from 'aws-lambda';

import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export interface BillingPortalRequestParams {
  customerId?: string
  dob?: string,
  email?: string
}

export interface BillingPortalResponse {
  customer: object,
  return_url: string,
  url: string
}

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { secrets, customerId,dob,email } = validatedParameters;
    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));

    const response: BillingPortalResponse = { url: '',customer: {}, return_url: '' };
    // search codes
    try {

      let customers;

      // Check if a customer exists
      customers = await stripe.customers.search({
        query: 'metadata[\'date_of_birth\']:\''+dob+'\' AND email:\'' + email+'\'',
        limit: 1
      });

      if(customers.data.length == 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Could not find customer"
          }),
        };
      }
      
      if(customers != undefined) {
        let customer = customers.data[0];

        const session = await stripe.billingPortal.sessions.create({
          configuration: getSecret(SecretsKeys.STRIPE_BILLING_CONFIGURATION, secrets),
          customer: customer.id,
          return_url: 'https://portal.hlthi.life/dashboard',
        });

        response.url = session.url;
        response.customer = customer;
      } else {

        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Could not find customer",
            data: response
          }),
        };
      }
      

    } catch (error) {
      console.error('Error while trying to get billing portal link', JSON.stringify(error));
      throw new Error(JSON.stringify(error));
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.log('Error: ', JSON.stringify(error.message));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
