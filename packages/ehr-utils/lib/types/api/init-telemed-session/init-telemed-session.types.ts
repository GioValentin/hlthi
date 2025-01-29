export interface InitTelemedSessionRequestParams {
  appointmentId: string;
  userId: string;
}

export interface InitTelemedSessionResponse {
  meetingData: MeetingData;
  encounterId: string;
  conversation?: {
    id: string
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
