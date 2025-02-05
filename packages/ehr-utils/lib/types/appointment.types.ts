export type AppointmentType = 'now' | 'prebook';

export enum ApptStatus {
  'ready' = 'ready',
  'pre-video' = 'pre-video',
  'on-video' = 'on-video',
  'pre-chat' = 'pre-chat',
  'on-chat' = 'on-chat',
  'unsigned' = 'unsigned',
  'complete' = 'complete',
  'cancelled' = 'cancelled',
}

export type TelemedCallStatuses = `${ApptStatus}`;
export const TelemedCallStatusesArr = ['ready', 'pre-video', 'on-video', 'unsigned', 'complete', 'on-chat'];

export const mapStatusToTelemed = (
  encounterStatus: string,
  appointmentStatus: string | undefined,
): ApptStatus | undefined => {
  switch (encounterStatus) {
    case 'planned':
      return ApptStatus.ready;
    case 'arrived':
      return ApptStatus['pre-video'];
    case 'in-progress':
      return ApptStatus['on-video'];
    case 'finished':
      if (appointmentStatus === 'fulfilled') return ApptStatus.complete;
      else return ApptStatus.unsigned;
    case 'cancelled':
      return ApptStatus.cancelled;
    case 'on-chat':
      return ApptStatus['on-chat'];
  }
  return undefined;
};
