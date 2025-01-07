import { BillingPortalRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

export function validateRequestParameters(input: ZambdaInput): BillingPortalRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { customerId } = JSON.parse(input.body);

  return {
    customerId: customerId || '',
    secrets: input.secrets,
  };
}
