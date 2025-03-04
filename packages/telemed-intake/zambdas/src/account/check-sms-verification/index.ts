
import { APIGatewayProxyResult } from 'aws-lambda';

import {
  SecretsKeys,
  ZambdaInput,
  getSecret,
  CreateAccountPhoneVerificationResponse
} from 'ottehr-utils';
import { validateCreateSMSConfirmationParams } from './validateRequestParameters';
import twilio from 'twilio'

// Lifting up value to outside of the handler allows it to stay in memory across warm lambda invocations
let zapehrToken: string;

const formatPhoneNumber = function(phone: string) {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Ensure it's a valid 10-digit US number
  if (digits.length === 10) {
      return `+1${digits}`;
  } else {
      throw new Error("Invalid phone number format");
  }
}

export const index = async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  
  try {
    const validatedParameters = validateCreateSMSConfirmationParams(input);
    const accountSid = getSecret(SecretsKeys.TWILIO_ACCOUNT_SID, input.secrets);
    const authToken = getSecret(SecretsKeys.TWILIO_AUTH_TOKEN, input.secrets);
    const verificationService = getSecret(SecretsKeys.TWILIO_VERIFICATION_SERVICE_SID, input.secrets);
    const client = twilio(accountSid, authToken);

    const verification = await client.verify.v2
      .services(verificationService)
      .verificationChecks.create({
        code: validatedParameters.code,
        to: formatPhoneNumber(validatedParameters.phone),
      });
    
    const response = {
      status: verification.status
    } as CreateAccountPhoneVerificationResponse;

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.log(error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' }),
    };
  }
};