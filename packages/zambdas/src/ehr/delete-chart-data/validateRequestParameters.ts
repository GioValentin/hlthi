import { DeleteChartDataRequest } from 'utils';
import { ZambdaInput } from '../../shared';

export function validateRequestParameters(input: ZambdaInput): DeleteChartDataRequest & Pick<ZambdaInput, 'secrets'> {
  if (!input.body) {
    throw new Error('No request body provided');
  }

  const data = JSON.parse(input.body) as DeleteChartDataRequest;

  const { encounterId } = data;

  if (encounterId === undefined) {
    throw new Error('These fields are required: "encounterId"');
  }

  return {
    ...data,
    secrets: input.secrets,
  };
}
