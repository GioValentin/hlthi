import { APIGatewayProxyResult } from 'aws-lambda';
import { CreateStripeCustomerResponse } from 'ottehr-components';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { mode,
      email,
      line_items,
      patientId,
      return_url,
      success_url,
      secrets
    } = validatedParameters;

    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));

    const response: CreateStripeCustomerResponse = { 
        customer: {}
    };


    try {

      const customers = await stripe.customers.search({
        query: 'metadata[\'patient_id\']:\''+patientId+'\'',
        limit: 1
      });

      

      // Check if a customer exists
      if(customers.data.length == 0) 
      {
        const session = await stripe.checkout.sessions.create({
          client_reference_id: patientId,
          customer_email: email,
          success_url: success_url,
          return_url: return_url,
          line_items: [
            {
              price: 'price_1MotwRLkdIwHu7ixYcPLm5uZ',
              quantity: 1,
            }
          ],
          mode: mode,
        });

        return {
          statusCode: 200,
          body: JSON.stringify(session)
        }

      } else {

        var customer = customers.data[0].id ? customers.data[0].id : '';

        const session = await stripe.checkout.sessions.create({
          customer: customer,
          client_reference_id: patientId,
          customer_email: email,
          success_url: success_url,
          return_url: return_url,
          line_items: [
            {
              price: 'price_1MotwRLkdIwHu7ixYcPLm5uZ',
              quantity: 1,
            }
          ],
          mode: mode,
        });

        return {
          statusCode: 200,
          body: JSON.stringify(session)
        }

      }


    } catch (error) {
      console.error('Error while trying to get billing portal link', JSON.stringify(error));
      throw new Error(JSON.stringify(error));
    }

  } catch (error: any) {
    console.log('Error: ', JSON.stringify(error.message));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
