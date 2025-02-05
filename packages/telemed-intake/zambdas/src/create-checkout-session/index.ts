import { APIGatewayProxyResult } from 'aws-lambda';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { mode,
      customer_email,
      line_items,
      customerId,
      return_url,
      success_url,
      secrets
    } = validatedParameters;

    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));


    try {

      console.log(customerId);

      const session = await stripe.customerSessions.create({
        customer: customerId,
        components: {
          pricing_table: {
            enabled: true,
          },
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify(session)
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
