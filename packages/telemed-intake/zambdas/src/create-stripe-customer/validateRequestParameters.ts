import { CreateStripeCustomerRequestParams } from 'ottehr-components';
import { Secrets, ZambdaInput } from 'ottehr-utils';

export function validateRequestParameters(input: ZambdaInput): CreateStripeCustomerRequestParams & { secrets: Secrets | null } {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { 
      email,
      firstName,
      lastName,
      phone,
      dob,
      patientId
    } = JSON.parse(input.body);

  return {
    patientId: patientId,
    email: email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    dob: dob || null,
    secrets: input.secrets,
  };
}
