import {
  CreateAccountPhoneVerificationParams,
  RequiredAllProps,
  Secrets,
  ZambdaInput,
} from 'ottehr-utils';

// Note that this file is copied from BH and needs significant changes
export function validateCreateSMSConfirmationParams(
  input: ZambdaInput,
): RequiredAllProps<CreateAccountPhoneVerificationParams> & { secrets: Secrets | null } {
  console.group('validateRequestParameters');

  if (!input.body) {
    throw new Error('No request body provided');
  }

  const {
    phone,
    code,
    verifyServiceId
  } = JSON.parse(input.body);

  
  return {
    phone,
    code,
    verifyServiceId,
    secrets: input.secrets,
  };
}
