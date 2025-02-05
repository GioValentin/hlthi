import { Encounter } from 'fhir/r4';
export interface InitTelemedSessionRequestParams {
  appointmentId: string;
  userId: string;
}

export interface InitTelemedSessionResponse {
  meetingData: MeetingData;
  encounterId: string;
}


export interface InitChatTelemedSessionResponse {
  encounter: Encounter;
  conversation?: {
    id: string,
    link: string
  };
}

export interface InitTelemedChatSessionResponse {
  conversation: {
    id: string
  }
}

export interface MeetingData {
  Attendee: object;
  Meeting: object;
}
