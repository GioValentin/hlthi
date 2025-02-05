
import { Secrets, ZambdaInput } from 'ottehr-utils';

export interface GetStripeSubscriptionRequestParams {
  patientId?: string
  dob?: string,
  email?: string
}

export interface GetStripeSubscriptionStatusResponse {
  active: boolean
}

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
