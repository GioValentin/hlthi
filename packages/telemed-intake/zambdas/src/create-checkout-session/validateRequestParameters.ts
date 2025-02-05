import { Secrets, ZambdaInput } from 'ottehr-utils';

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

export function validateRequestParameters(input: ZambdaInput): CreateStripeCheckoutSessionRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      patientId,
      customer_email,
      items,
      mode,
      return_url,
      success_url,
      customerId
    } = JSON.parse(input.body);

  return {
    mode: mode,
    customerId: customerId,
    customer_email: customer_email,
    line_items: items,
    return_url: return_url,
    success_url: success_url,
    secrets: input.secrets
  };
}
