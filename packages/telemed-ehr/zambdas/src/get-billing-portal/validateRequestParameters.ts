import { BillingPortalRequestParams, Secrets } from 'ehr-utils';
import { ZambdaInput } from '../types';

export function validateRequestParameters(input: ZambdaInput): BillingPortalRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { userId } = JSON.parse(input.body);

  return {
    customerId: userId || '',
    secrets: input.secrets,
  };
}
