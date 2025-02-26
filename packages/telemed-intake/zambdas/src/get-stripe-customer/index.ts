import { APIGatewayProxyResult } from 'aws-lambda';
import { Secrets, ZambdaInput,getSecret,SecretsKeys } from 'ottehr-utils';
import { validateRequestParameters } from './validateRequestParameters';
import Stripe from 'stripe'

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    const { 
      customerId,
      sessionId,
      secrets
    } = validatedParameters;

    console.groupEnd();
    console.debug('validateRequestParameters success');

    const stripe = new Stripe(getSecret(SecretsKeys.STRIPE_SECRET, secrets));
    const stripeConfig = getSecret(SecretsKeys.STRIPE_BILLING_CONFIGURATION, secrets);
    const websiteUrl = getSecret(SecretsKeys.WEBSITE_URL, secrets);

    const response = {
      customer: {} as Stripe.Customer,
      session: {} as Stripe.CustomerSession,
      portal: {} as Stripe.BillingPortal.Session,
      setupIntent: {} as Stripe.SetupIntent,
      paymentMethods: {} as Stripe.ApiList<Stripe.PaymentMethod>
    }

    const customers = await stripe.customers.search({
      query: 'metadata[\'sub\']:\''+customerId+'\'',
      limit: 1
    });

    // Check if a customer does not exists
    if(customers.data.length == 0) 
    {
      // Create a Customer 
      response.customer = await stripe.customers.create({
        metadata: {
          sub: customerId
        }
      });

      try {
        const subscription = await stripe.subscriptions.create({
          customer: response.customer.id,
          items: [
            {
              price: getSecret(SecretsKeys.STRIPE_DEFAULT_PRICE_ID, secrets),
            },
          ],
        });
      } catch(e) {
        console.log(e);
      }
      

    } else {
      response.customer = customers.data[0];
    }

    // @ts-ignore
    response.customer = await stripe.customers.retrieve(response.customer.id, {
      expand: ['subscriptions'],
    }) ;

    if(!sessionId) {
      const paymentMethods = await stripe.customers.listPaymentMethods(
        response.customer.id,
        {
          limit: 5,
        }
      );
  
      response.paymentMethods = paymentMethods;
  
      try {
  
        const session = await stripe.customerSessions.create({
          customer: response.customer.id,
          components: {
            payment_element: {
              enabled: true,
              features: {
                payment_method_allow_redisplay_filters: ['always'],
                payment_method_redisplay: 'enabled',
                payment_method_remove: 'enabled',
                payment_method_save: 'enabled',
                payment_method_save_usage: 'off_session'
              },
            },
          },
        });
  
        response.session = session;

        const setupIntent = await stripe.setupIntents.create({
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          },
          confirm: false,
          customer: response.customer.id,
          usage: 'off_session'
        });
  
        response.setupIntent = setupIntent;

        return {
          statusCode: 200,
          body: JSON.stringify(response)
        }

      } catch (error) {
        console.error('Error while trying to get billing portal link', JSON.stringify(error));
        throw new Error(JSON.stringify(error));
      }

    }

    // const configuration = await stripe.billingPortal.configurations.create({
    //   features: {
    //     customer_update: {
    //       allowed_updates: ['name', 'email','phone','address'],
    //       enabled: true,
    //     },
    //     invoice_history: {
    //       enabled: true,
    //     },
    //     payment_method_update: {
    //       enabled: true
    //     },
    //     subscription_cancel: {
    //       enabled: true,
    //       mode: 'immediately',
    //       proration_behavior: 'create_prorations'
    //     },
    //     subscription_update: {
    //       enabled: true,
    //       default_allowed_updates: ['price','promotion_code'],
    //       products: [
    //         {
    //           prices: ["price_1Qr6yDIiL0oeTlYveB6PhxvW","price_1Qr6yDIiL0oeTlYv4ADvH6TI"],
    //           product: "prod_RkcCD7doJzhHjk"
    //         },
    //         {
    //           prices: ["price_1Qenc0IiL0oeTlYvnAEWPWVC","price_1QenbgIiL0oeTlYvpKVVRW00"],
    //           product: "prod_RXtOWRDt9YfPcM"
    //         },
    //         {
    //           prices: ["price_1QenenIiL0oeTlYvq9j1j9tV","price_1QenkDIiL0oeTlYvonqVXUla"],
    //           product: "prod_RXtRaCsYfuMoWR"
    //         },
    //         {
    //           prices: ["price_1QenjEIiL0oeTlYvtRRuUWuM","price_1QenjaIiL0oeTlYv7S5hIza9"],
    //           product: "prod_RXtWVgiZ73pgP6"
    //         }
    //       ],
    //       proration_behavior: 'always_invoice'
    //     }
    //   },
    //   business_profile: {
    //     headline: 'HLTHI Billing Portal'

    //   }
    // });
    
    // console.log(configuration.id);
    
    const session = await stripe.billingPortal.sessions.create({
      configuration: stripeConfig,
      customer: response.customer.id,
      return_url: `${websiteUrl}/patient-portal`,
    });

    response.portal = session;

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    }


  } catch (error: any) {
    console.log('Error: ', JSON.stringify(error.message));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
