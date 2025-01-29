import { Secrets } from "../../../main";

interface LambdaSecrets {
  secrets: Secrets | null;
}

export interface JoinChatRoomRequestParameters {
  conversationID: string | undefined | null;
}

export type JoinChatRoomInput = JoinChatRoomRequestParameters & LambdaSecrets;
export type JoinChatRoomResponse = ChatMeetingData;

export interface ChatMeetingData {
  Attendee: object;
  Meeting: {
      tokenized: string  | undefined,
      endpoint: string  | undefined,
      generatedLink: string | undefined
  };
}
