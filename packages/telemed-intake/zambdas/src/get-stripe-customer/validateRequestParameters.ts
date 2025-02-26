import { Secrets, ZambdaInput } from 'ottehr-utils';

import Stripe from 'stripe';

export interface CreateStripeCheckoutSessionRequestParams {
  customerId: string;
  sessionId?: boolean;
}

export interface CreateStripeCheckoutSessionResponse {
  customer: Stripe.Customer,
  session: Stripe.CustomerSession
}

export function validateRequestParameters(input: ZambdaInput): CreateStripeCheckoutSessionRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  let ses = false;

  const { 
      customerId,
      sessionId
    } = JSON.parse(input.body);

  if(sessionId) {
    ses = sessionId;
  }

  return {
    customerId: customerId,
    sessionId: ses,
    secrets: input.secrets
  };
}
