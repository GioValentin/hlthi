import { GetStripeSubscriptionRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

export function validateRequestParameters(input: ZambdaInput): GetStripeSubscriptionRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      patientId,
      dob,
      email
    } = JSON.parse(input.body);

  return {
    email: email,
    dob: dob,
    patientId: patientId,
    secrets: input.secrets
  };
}
