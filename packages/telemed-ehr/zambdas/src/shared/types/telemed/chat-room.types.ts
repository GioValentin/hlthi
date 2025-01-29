import { Encounter } from 'fhir/r4';
import { EncounterVirtualServiceExtension, OtherParticipantsExtension } from 'ehr-utils';

export interface CreateTelemedChatRoomRequestPayload {
  encounter: Encounter & {
    extension?: OtherParticipantsExtension[];
  };
}

export interface CreateTelemedChatRoomResponse {
  encounter: Encounter & {
    extension: (OtherParticipantsExtension | EncounterVirtualServiceExtension)[];
  };
}
