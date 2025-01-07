import { APIGatewayProxyResult } from 'aws-lambda';
import { BillingPortalResponse } from 'ehr-utils';
import { SecretsKeys, getSecret } from '../shared';
import { ZambdaInput } from '../types';
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

      let customer = customers.data[0];

      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: 'https://portal.hlthi.life/dashboard',
      });

      response.url = session.url;
      response.customer = customer;

    } catch (error) {
      console.error('Error while trying to request NLM ICD10 search endpoint', JSON.stringify(error));
      throw new Error('Error while trying to get ICD-10 codes');
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
