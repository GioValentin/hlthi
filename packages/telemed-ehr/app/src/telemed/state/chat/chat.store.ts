import { MeetingData } from 'ehr-utils';
import { create } from 'zustand';


export interface Conversation {
  id: string,
  encounterId: string | undefined,
  link: string
}

export interface ChatState {
  meetingData: MeetingData | object | null;
  conversation: Conversation | null;
  twilioAuth: string | null;
}

const CHAT_STATE_INITIAL: ChatState = {
  meetingData: null,
  conversation: null,
  twilioAuth: null
};

export const useChatStore = create<ChatState>()(() => ({
  ...CHAT_STATE_INITIAL,
}));
