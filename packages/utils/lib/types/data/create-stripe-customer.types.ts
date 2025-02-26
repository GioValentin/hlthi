import Stripe from 'stripe';
export interface CreateStripeCustomerlResponse {
    customer: Stripe.Customer;
    session: Stripe.CustomerSession;
  }
  
  export interface CreateStripeCustomerRequestParams {
    customerId: string,
    sessionId?: boolean
  }
  