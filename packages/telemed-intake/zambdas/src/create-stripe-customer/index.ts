import { APIGatewayProxyResult } from 'aws-lambda';
import { CreateStripeCustomerResponse } from 'ottehr-components';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
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
        // Create a Customer 
        response.customer = await stripe.customers.create({
          name: firstName + ' ' + lastName,
          email: email,
          phone: phone,
          metadata: {
            date_of_birth: dob,
            patient_id: patientId
          }
        });

        return {
          statusCode:200,
          body: JSON.stringify(response)
        }

      } else {

        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Customer Already Exists'
          })
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
