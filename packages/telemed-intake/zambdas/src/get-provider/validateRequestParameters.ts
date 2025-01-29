import { ZambdaInput } from 'ottehr-utils';
import { GetProviderInput } from '.';

export function validateRequestParameters(input: ZambdaInput): GetProviderInput {

  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { uuid } = JSON.parse(input.body);

  if (!uuid) {
    throw new Error('uuid is not found and is required');
  }
  
  return {
    secrets: input.secrets,
    uuid: uuid
  };
}
