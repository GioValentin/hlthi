import { APIGatewayProxyResult } from 'aws-lambda';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {

    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { secrets, email,
      firstName,
      lastName,
      phone,
      dob,
      patientId } = validatedParameters;
    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));

    const response = { 
        customer: {}
    };

    try {

      const customers = await stripe.customers.search({
        query: 'metadata[\'date_of_birth\']:\''+dob+'\' AND email:\'' + email+'\'',
        limit: 1
      });

      // Check if a customer does not exists
      if(customers.data.length == 0) 
      {
        // Create a Customer 
        response.customer = await stripe.customers.create({
          name: firstName + ' ' + lastName,
          email: email,
          phone: phone,
          metadata: {
            date_of_birth: dob
          }
        });

        return {
          statusCode:200,
          body: JSON.stringify(response)
        }
      } else {

        return {
          statusCode: 200,
          body: JSON.stringify(customers.data[0])
        }
      }
  } catch (error: any) {
    console.debug('Error: ', JSON.stringify(error.message));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
