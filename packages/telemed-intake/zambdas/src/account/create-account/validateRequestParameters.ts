import { DateTime } from 'luxon';
import {
  CreateAccountRequestParams,
  RequiredAllProps,
  Secrets,
  ZambdaInput,
} from 'ottehr-utils';

// Note that this file is copied from BH and needs significant changes
export function validateCreateAccountParams(
  input: ZambdaInput,
): RequiredAllProps<CreateAccountRequestParams> & { secrets: Secrets | null } {
  console.group('validateRequestParameters');

  if (!input.body) {
    throw new Error('No request body provided');
  }

  const {
    account
  } = JSON.parse(input.body);

  
  return {
    account,
    secrets: input.secrets
  };
}
