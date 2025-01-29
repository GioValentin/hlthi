import { ZambdaClient } from '@zapehr/sdk';

import {
  CancelAppointmentRequestParams,
  CancelInviteParticipantRequestParameters,
  CancelInviteParticipantResponse,
  CreateAppointmentUCTelemedParams,
  CreateAppointmentUCTelemedResponse,
  CreatePaperworkInput,
  CreatePaperworkResponse,
  GetScheduleRequestParams,
  GetScheduleResponse,
  GetPaperworkRequestParams,
  GetTelemedAppointmentsRequest,
  GetTelemedAppointmentsResponse,
  InviteParticipantRequestParameters,
  JoinCallRequestParameters,
  JoinChatRoomRequestParameters,
  JoinCallResponse,
  ListInvitedParticipantsRequestParameters,
  ListInvitedParticipantsResponse,
  PaperworkResponseWithResponses,
  PaperworkResponseWithoutResponses,
  PatientInfo,
  UpdateAppointmentRequestParams,
  UpdateAppointmentResponse,
  UpdatePaperworkInput,
  UpdatePaperworkResponse,
  VideoChatCreateInviteResponse,
  WaitingRoomInput,
  WaitingRoomResponse,
  isoStringFromMDYString,
  GetBillingPortalRequestParams,
  GetBillingPortalResponse,
  CreateStripeCustomerRequestParams,
  CreateStripeCustomerlResponse,
  CreateStripeCheckoutSessionResponse,
  CreateStripeCheckoutSessionRequestParams,
  GetPatientSubscriptionStatusRequestParams,
  GetPatientSubscriptionStatusResponse,
  JoinChatRoomResponse
} from 'ottehr-utils';
import { ApiError, GetZapEHRAPIParams } from '../types/data';
import { HealthcareService, Location, Practitioner } from 'fhir/r4';

enum ZambdaNames {
  'check in' = 'check in',
  'create appointment' = 'create appointment',
  'cancel telemed appointment' = 'cancel telemed appointment',
  'cancel in person appointment' = 'cancel in person appointment',
  'update appointment' = 'update appointment',
  'get appointments' = 'get appointments',
  'get patients' = 'get patients',
  'get paperwork' = 'get paperwork',
  'get groups' = 'get groups',
  'create paperwork' = 'create paperwork',
  'update paperwork' = 'update paperwork',
  'get schedule' = 'get schedule',
  'get wait status' = 'get wait status',
  'join call' = 'join call',
  'video chat create invite' = 'video chat create invite',
  'video chat cancel invite' = 'video chat cancel invite',
  'video chat list invites' = 'video chat list invites',
  'get presigned file url' = 'get presigned file url',
  'get providers' = 'get providers',
  'get locations' = 'get locations',
  'get billing portal' = 'get billing portal',
  'create stripe customer' = 'create stripe customer',
  'get patient subscription status' = 'get patient subscription status',
  'create stripe checkout session' = 'create stripe checkout session',
  'get provider' = 'get provider'
}

const zambdasPublicityMap: Record<keyof typeof ZambdaNames, boolean> = {
  'check in': true,
  'create appointment': false,
  'cancel telemed appointment': false,
  'cancel in person appointment': false,
  'update appointment': false,
  'get appointments': false,
  'get patients': false,
  'get paperwork': false,
  'create paperwork': false,
  'update paperwork': false,
  'get schedule': true,
  'get wait status': true,
  'join call': true,
  'video chat create invite': false,
  'video chat cancel invite': false,
  'video chat list invites': false,
  'get presigned file url': true,
  'get providers': true,
  'get locations': true,
  'get groups': true,
  'get billing portal': false,
  'create stripe customer': false,
  'get patient subscription status': false,
  'create stripe checkout session': false,
  'get provider': true
};

export type ZapEHRAPIClient = ReturnType<typeof getZapEHRAPI>;

export const getZapEHRAPI = (
  params: GetZapEHRAPIParams,
  zambdaClient: ZambdaClient,
): {
  checkIn: typeof checkIn;
  createAppointment: typeof createAppointment;
  cancelTelemedAppointment: typeof cancelTelemedAppointment;
  cancelInPersonAppointment: typeof cancelInPersonAppointment;
  updateAppointment: typeof updateAppointment;
  getPatients: typeof getPatients;
  getGroups: typeof getGroups;
  getProviders: typeof getProviders;
  getLocations: typeof getLocations;
  createPaperwork: typeof createPaperwork;
  updatePaperwork: typeof updatePaperwork;
  getSchedule: typeof getSchedule;
  getAppointments: typeof getAppointments;
  getPaperwork: typeof getPaperwork;
  getPaperworkPublic: typeof getPaperworkPublic;
  getWaitStatus: typeof getWaitStatus;
  joinCall: typeof joinCall;
  getProvider: typeof getProvider;
  getConversationLink: typeof getConversationLink;
  videoChatCreateInvite: typeof videoChatCreateInvite;
  videoChatCancelInvite: typeof videoChatCancelInvite;
  videoChatListInvites: typeof videoChatListInvites;
  createZ3Object: typeof createZ3Object;
  getBillingPortalLink: typeof getBillingPortalLink;
  createStripeCustomer: typeof createStripeCustomer;
  createStripeCheckoutSession: typeof createStripeCheckoutSession;
  getPatientSubscriptionStatus: typeof getPatientSubscriptionStatus;
} => {
  const {
    checkInZambdaID,
    createAppointmentZambdaID,
    cancelTelemedAppointmentZambdaID,
    cancelInPersonAppointmentZambdaID,
    updateAppointmentZambdaID,
    getAppointmentsZambdaID,
    getPatientsZambdaID,
    getPaperworkZambdaID,
    createPaperworkZambdaID,
    updatePaperworkZambdaID,
    getScheduleZambdaID,
    getWaitStatusZambdaID,
    joinCallZambdaID,
    videoChatCreateInviteZambdaID,
    videoChatCancelInviteZambdaID,
    videoChatListInvitesZambdaID,
    getPresignedFileURLZambdaID,
    getProvidersZambdaID,
    getLocationsZambdaID,
    getGroupsZambdaID,
    getBillingPortalZambdaID,
    createStripeCustomerZambdaID,
    getPatientSubscriptionStatusZambdaID,
    createStripeCheckoutSessionZambdaID,
    getProviderZambdaID
  } = params;

  const zambdasToIdsMap: Record<keyof typeof ZambdaNames, string | undefined> = {
    'check in': checkInZambdaID,
    'create appointment': createAppointmentZambdaID,
    'cancel telemed appointment': cancelTelemedAppointmentZambdaID,
    'cancel in person appointment': cancelInPersonAppointmentZambdaID,
    'update appointment': updateAppointmentZambdaID,
    'get appointments': getAppointmentsZambdaID,
    'get patients': getPatientsZambdaID,
    'get providers': getProvidersZambdaID,
    'get locations': getLocationsZambdaID,
    'get groups': getGroupsZambdaID,
    'get paperwork': getPaperworkZambdaID,
    'create paperwork': createPaperworkZambdaID,
    'update paperwork': updatePaperworkZambdaID,
    'get schedule': getScheduleZambdaID,
    'get wait status': getWaitStatusZambdaID,
    'join call': joinCallZambdaID,
    'video chat create invite': videoChatCreateInviteZambdaID,
    'video chat cancel invite': videoChatCancelInviteZambdaID,
    'video chat list invites': videoChatListInvitesZambdaID,
    'get presigned file url': getPresignedFileURLZambdaID,
    'get billing portal':getBillingPortalZambdaID,
    'create stripe customer':createStripeCustomerZambdaID,
    'get patient subscription status': getPatientSubscriptionStatusZambdaID,
    'create stripe checkout session': createStripeCheckoutSessionZambdaID,
    'get provider': getProviderZambdaID
  };
  const isAppLocalProvided = params.isAppLocal != null;
  const isAppLocal = params.isAppLocal === 'true';

  const verifyZambdaProvidedAndNotLocalThrowErrorOtherwise = (
    zambdaID: string | undefined,
    zambdaName: keyof typeof zambdasToIdsMap,
  ): zambdaID is Exclude<typeof zambdaID, undefined> => {
    if (zambdaID === undefined || !isAppLocalProvided) {
      throw new Error(`${zambdaName} zambda environment variable could not be loaded`);
    }
    return true;
  };

  const chooseJson = (json: any): any => {
    return isAppLocal ? json : json.output;
  };

  const makeZapRequest = async <TResponse, TPayload>(
    zambdaName: keyof typeof ZambdaNames,
    payload?: TPayload,
    additionalErrorHandler?: (error: unknown) => void,
  ): Promise<TResponse> => {
    const zambdaId = zambdasToIdsMap[zambdaName];

    try {
      if (verifyZambdaProvidedAndNotLocalThrowErrorOtherwise(zambdaId, zambdaName)) {
        let zambdaMethodToInvoke: ZambdaClient['invokeZambda'] | ZambdaClient['invokePublicZambda'];

        if (zambdasPublicityMap[zambdaName]) {
          zambdaMethodToInvoke = zambdaClient.invokePublicZambda;
        } else {
          zambdaMethodToInvoke = zambdaClient.invokeZambda;
        }

        zambdaMethodToInvoke = zambdaMethodToInvoke.bind(zambdaClient);

        const response = await zambdaMethodToInvoke({
          zambdaId: zambdaId,
          payload,
        });

        const jsonToUse = chooseJson(response);
        return jsonToUse;
      }
      // won't be reached, but for TS to give the right return type
      throw Error();
    } catch (error) {
      additionalErrorHandler && additionalErrorHandler(error);
      throw apiErrorToThrow(error);
    }
  };

  const checkIn = async (appointmentId: string): Promise<any> => {
    return await makeZapRequest('check in', { appointment: appointmentId }, NotFoundApointmentErrorHandler);
  };

  const createAppointment = async (
    parameters: CreateAppointmentUCTelemedParams,
  ): Promise<CreateAppointmentUCTelemedResponse> => {
    const fhirParams = fhirifyAppointmentInputs({ ...parameters });
    return await makeZapRequest('create appointment', fhirParams);
  };

  const cancelTelemedAppointment = async (parameters: CancelAppointmentRequestParams): Promise<any> => {
    return await makeZapRequest('cancel telemed appointment', parameters, NotFoundApointmentErrorHandler);
  };

  const cancelInPersonAppointment = async (parameters: CancelAppointmentRequestParams): Promise<any> => {
    return await makeZapRequest('cancel in person appointment', parameters, NotFoundApointmentErrorHandler);
  };

  const updateAppointment = async (parameters: UpdateAppointmentRequestParams): Promise<UpdateAppointmentResponse> => {
    return await makeZapRequest('update appointment', parameters);
  };

  const getPatients = async (): Promise<{ patients: PatientInfo[] }> => {
    return await makeZapRequest('get patients');
  };

  const getProviders = async (): Promise<Practitioner[]> => {
    return await makeZapRequest('get providers');
  };

  const getGroups = async (): Promise<HealthcareService[]> => {
    return await makeZapRequest('get groups');
  };

  const getLocations = async (): Promise<Location[]> => {
    return await makeZapRequest('get locations');
  };

  const createPaperwork = async (
    parameters: Pick<CreatePaperworkInput, 'appointmentID' | 'files' | 'paperwork' | 'paperworkComplete' | 'timezone'>,
  ): Promise<CreatePaperworkResponse> => {
    const payload = Object.fromEntries(
      Object.entries(parameters).filter(
        ([_parameterKey, parameterValue]) =>
          parameterValue && !Object.values(parameterValue).every((tempValue) => tempValue === undefined),
      ),
    );
    return await makeZapRequest('create paperwork', payload);
  };

  const updatePaperwork = async (
    parameters: Pick<UpdatePaperworkInput, 'appointmentID' | 'files' | 'paperwork' | 'timezone'>,
  ): Promise<UpdatePaperworkResponse> => {
    const payload = Object.fromEntries(
      Object.entries(parameters).filter(
        ([_parameterKey, parameterValue]) =>
          parameterValue && !Object.values(parameterValue).every((tempValue) => tempValue === undefined),
      ),
    );
    return await makeZapRequest('update paperwork', payload);
  };

  const getSchedule = async (parameters: GetScheduleRequestParams): Promise<GetScheduleResponse> => {
    return await makeZapRequest('get schedule', parameters);
  };

  const getAppointments = async (
    parameters?: GetTelemedAppointmentsRequest,
  ): Promise<GetTelemedAppointmentsResponse> => {
    return await makeZapRequest('get appointments', parameters);
  };

  const getPaperwork = async (parameters: GetPaperworkRequestParams): Promise<PaperworkResponseWithResponses> => {
    return await makeZapRequest('get paperwork', parameters, NotFoundApointmentErrorHandler);
  };

  const getBillingPortalLink = async (parameters: GetBillingPortalRequestParams): Promise<GetBillingPortalResponse> => {
    return await makeZapRequest('get billing portal', parameters, NotFoundApointmentErrorHandler);
  };

  const createStripeCustomer = async (parameters: CreateStripeCustomerRequestParams): Promise<CreateStripeCustomerlResponse> => {
    return await makeZapRequest('create stripe customer', parameters, NotFoundApointmentErrorHandler);
  };

  const createStripeCheckoutSession = async (parameters: CreateStripeCheckoutSessionRequestParams): Promise<CreateStripeCheckoutSessionResponse> => {
    return await makeZapRequest('create stripe checkout session', parameters, NotFoundApointmentErrorHandler);
  };

  const getPatientSubscriptionStatus = async (parameters: GetPatientSubscriptionStatusRequestParams): Promise<GetPatientSubscriptionStatusResponse> => {
    return await makeZapRequest('get patient subscription status', parameters, NotFoundApointmentErrorHandler);
  };

  const getPaperworkPublic = async (
    parameters: GetPaperworkRequestParams,
  ): Promise<PaperworkResponseWithoutResponses> => {
    return await makeZapRequest('get paperwork', parameters, NotFoundApointmentErrorHandler);
  };

  const getWaitStatus = async (
    parameters: Omit<WaitingRoomInput, 'secrets' | 'authorization'>,
  ): Promise<WaitingRoomResponse> => {
    return await makeZapRequest('get wait status', parameters);
  };

  const joinCall = async (parameters: JoinCallRequestParameters): Promise<JoinCallResponse> => {
    return await makeZapRequest('join call', parameters);
  };

  const getProvider = async (parameters: {uuid: string}): Promise<object> => {
    return await makeZapRequest('get provider', parameters);
  };

  const getConversationLink = async (
    token: string | null | undefined,
    parameters: JoinChatRoomRequestParameters,
    appointmentID: string,
    person: Object,
    VITE_APP_PROJECT_API_CONSOLE_URL: string, 
    VITE_APP_ZAPEHR_PROJECT_ID: string,
    VITE_APP_CHAT_ROOM_ENDPOINT: string
  ): Promise<JoinChatRoomResponse> => {

    if(!token) {
      throw new Error('Failed to authenicate, are you sure you\'re logged in?');
    }
    
    const url = `${VITE_APP_PROJECT_API_CONSOLE_URL}/messaging/conversation/token`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'x-zapehr-project-id': VITE_APP_ZAPEHR_PROJECT_ID
      }
    };

    const res = await fetch(url, options);
    
    if(!res.ok) {
      throw new Error('Failed to obtain conversation token, are you sure you are allowed in?');
    }

    let to = await res.json();

    console.log(parameters.conversationID);
    console.log(parameters)
    let requestObject = {
      patient: person,
      sid: parameters.conversationID,
      appointmentId: appointmentID,
      token: to?.token
    };

    let meetingData = {
      tokenized: btoa(JSON.stringify(requestObject)),
      endpoint: VITE_APP_CHAT_ROOM_ENDPOINT,
      generatedLink: `${VITE_APP_CHAT_ROOM_ENDPOINT}?payload=${btoa(JSON.stringify(requestObject))}`
    };

    let responseData = {
      Attendee: person,
      Meeting: meetingData
    } as JoinChatRoomResponse;

    return Promise.resolve(responseData);
  };

  const videoChatCreateInvite = async (
    parameters: InviteParticipantRequestParameters,
  ): Promise<VideoChatCreateInviteResponse> => {
    return await makeZapRequest('video chat create invite', parameters);
  };

  const videoChatCancelInvite = async (
    parameters: CancelInviteParticipantRequestParameters,
  ): Promise<CancelInviteParticipantResponse> => {
    return await makeZapRequest('video chat cancel invite', parameters);
  };

  const videoChatListInvites = async (
    parameters: ListInvitedParticipantsRequestParameters,
  ): Promise<ListInvitedParticipantsResponse> => {
    return await makeZapRequest('video chat list invites', parameters);
  };

  const createZ3Object = async (
    appointmentID: string,
    fileType: string,
    fileFormat: string,
    file: File,
  ): Promise<any> => {
    try {
      const presignedURLRequest = await getPresignedFileURL(appointmentID, fileType, fileFormat);

      const uploadResponse = await fetch(presignedURLRequest.presignedURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return presignedURLRequest;
    } catch (error: unknown) {
      throw apiErrorToThrow(error);
    }
  };

  const getPresignedFileURL = async (appointmentID: string, fileType: string, fileFormat: string): Promise<any> => {
    const payload = {
      appointmentID,
      fileType,
      fileFormat,
    };
    return await makeZapRequest('get presigned file url', payload);
  };

  return {
    checkIn,
    createAppointment,
    cancelTelemedAppointment,
    cancelInPersonAppointment,
    updateAppointment,
    getPaperwork,
    createPaperwork,
    updatePaperwork,
    getPaperworkPublic,
    getPatients,
    getAppointments,
    getProviders,
    getLocations,
    getGroups,
    createZ3Object,
    getSchedule,
    getWaitStatus,
    joinCall,
    videoChatCreateInvite,
    videoChatCancelInvite,
    videoChatListInvites,
    getBillingPortalLink,
    getPatientSubscriptionStatus,
    createStripeCheckoutSession,
    createStripeCustomer,
    getProvider,
    getConversationLink
  };
};

const fhirifyAppointmentInputs = (inputs: CreateAppointmentUCTelemedParams): CreateAppointmentUCTelemedParams => {
  const returnParams = { ...inputs };
  const { patient } = returnParams;

  const { dateOfBirth: patientBirthDate } = patient as PatientInfo;
  if (patient) {
    patient.dateOfBirth = isoStringFromMDYString(patientBirthDate ?? '');
  }

  returnParams.patient = patient;

  return returnParams;
};

const InternalError: ApiError = {
  message: 'Internal Service Error',
};

const isApiError = (error: any): boolean => error instanceof Object && error && 'message' in error;

export const apiErrorToThrow = (error: any): ApiError => {
  console.error(`Top level catch block:\nError: ${error}\nError stringified: ${JSON.stringify(error)}`);
  if (isApiError(error)) {
    return error;
  } else {
    console.error('An endpoint threw and did not provide a well formed ApiError');
    return InternalError;
  }
};

function NotFoundApointmentErrorHandler(error: any): void {
  if (error.message === 'Appointment is not found') {
    throw error;
  }
}
