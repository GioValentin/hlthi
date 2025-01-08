import { CreateStripeCheckoutSessionRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

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
