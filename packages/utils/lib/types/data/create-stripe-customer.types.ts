import Stripe from 'stripe';
export interface CreateStripeCustomerlResponse {
    customer: Stripe.Customer;
  }
  
  export interface CreateStripeCustomerRequestParams {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dob: string;
    patientId: string;
  }
  