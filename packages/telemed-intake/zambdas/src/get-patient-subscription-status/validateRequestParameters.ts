import { GetStripeSubscriptionRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

export function validateRequestParameters(input: ZambdaInput): GetStripeSubscriptionRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      patientId
    } = JSON.parse(input.body);

  return {
    patientId: patientId,
    secrets: input.secrets
  };
}
