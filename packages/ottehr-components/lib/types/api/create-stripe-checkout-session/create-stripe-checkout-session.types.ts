import Stripe from 'stripe';

export interface CreateStripeCheckoutSessionRequestParams {
  customerId: string;
  customer_email: string;
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  mode: 'setup' | 'payment' | 'subscription',
  return_url: string,
  success_url: string
}

export interface CreateStripeCheckoutSessionResponse {
  id?: string;
  url?: string;
  client_secret: string;
}