import { APIGatewayProxyResult } from 'aws-lambda';
import { GetStripeSubscriptionStatusResponse } from 'ottehr-components';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { 
      secrets,
      dob,
      email
    } = validatedParameters;
    console.groupEnd();
    

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));

    const response: GetStripeSubscriptionStatusResponse = { 
        active: false
    };

    try {

        const customers = await stripe.customers.search({
          query: 'metadata[\'date_of_birth\']:\''+dob+'\' AND email:\'' + email+'\'',
          limit: 1
        });
  
        // Check if a customer exists
        if(customers.data.length == 0) 
        {
          console.log("Did not find customer: " + email + " DOB: " + dob);
          return {
            statusCode: 200,
            body: JSON.stringify(response)
          }
  
        } else {
          
          console.debug('Looking for subscriptions');

          const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: 'active'
          });
  
          if(subscriptions.data.length == 0) {

            console.debug('Did not find any');
            const lookForTrials = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: 'trialing'
            });
  
            if(lookForTrials.data.length == 0) {
              return {
                statusCode: 200,
                body: JSON.stringify(response)
              }
            }
          }
  
          response.active = true;

          console.debug('Active');
  
          return {
            statusCode: 200,
            body: JSON.stringify(response)
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
