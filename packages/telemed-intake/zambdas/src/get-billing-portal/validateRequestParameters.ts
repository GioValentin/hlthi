
import { Secrets, ZambdaInput } from 'ottehr-utils';
export interface BillingPortalRequestParams {
  customerId?: string
  dob?: string,
  email?: string
}

export interface BillingPortalResponse {
  customer: object,
  return_url: string,
  url: string
}

export function validateRequestParameters(input: ZambdaInput): BillingPortalRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { customerId,
    dob,
    email
   } = JSON.parse(input.body);

  return {
    customerId: customerId || '',
    email: email || '',
    dob: dob || '',
    secrets: input.secrets,
  };
}
