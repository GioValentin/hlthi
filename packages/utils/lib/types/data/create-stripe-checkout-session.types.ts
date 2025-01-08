import Stripe from 'stripe';
export interface CreateStripeCheckoutSessionResponse {
  id?: string;
  url?: string;
  client_secret: string;
}

export interface CreateStripeCheckoutSessionRequestParams {
  mode: 'setup' | 'payment' | 'subscription';
  items: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerId: string;
  return_url: string;
  success_url: string;
}