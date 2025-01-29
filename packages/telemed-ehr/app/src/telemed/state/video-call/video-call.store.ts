import { MeetingData } from 'ehr-utils';
import { create } from 'zustand';

export interface VideoCallState {
  meetingData: MeetingData | object | null;
  conversation: object | null;
  twilioAuth: string | null;
}

const VIDEO_CALL_STATE_INITIAL: VideoCallState = {
  meetingData: null,
  conversation: null,
  twilioAuth: null
};

export const useVideoCallStore = create<VideoCallState>()(() => ({
  ...VIDEO_CALL_STATE_INITIAL,
}));
