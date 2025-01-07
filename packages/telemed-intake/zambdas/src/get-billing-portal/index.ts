import { APIGatewayProxyResult } from 'aws-lambda';
import { BillingPortalResponse } from 'ottehr-components';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { secrets, customerId } = validatedParameters;
    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));

    const response: BillingPortalResponse = { url: '',customer: {}, return_url: '' };
    // search codes
    try {

      const customers = await stripe.customers.search({
        query: 'metadata[\'patient_id\']:\''+customerId+'\'',
        limit: 1
      });

      // Check if a customer exists
      if(customers.data.length == 0) 
      {

        // Failed to Find a Customer 
        
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Could not find customer"
          }),
        };

      }

      let customer = customers.data[0];

      const session = await stripe.billingPortal.sessions.create({
        configuration: 'bpc_1QWmn3IiL0oeTlYvNfo7TKMh',
        customer: customer.id,
        return_url: 'https://portal.hlthi.life/dashboard',
      });

      response.url = session.url;
      response.customer = customer;

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
