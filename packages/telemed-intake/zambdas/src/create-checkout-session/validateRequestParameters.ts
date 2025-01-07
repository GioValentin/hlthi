import { CreateStripeCheckoutSessionRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

export function validateRequestParameters(input: ZambdaInput): CreateStripeCheckoutSessionRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      patientId,
      email,
      line_items,
      mode,
      return_url,
      success_url
    } = JSON.parse(input.body);

  return {
    mode: mode,
    email: email,
    line_items: line_items,
    patientId: patientId,
    return_url: return_url,
    success_url: success_url,
    secrets: input.secrets
  };
}
