// @ts-nocheck
import { AppClient, FhirClient, User } from '@zapehr/sdk';
import { Appointment, Encounter, RelatedPerson, EncounterLocation } from 'fhir/r4';
import { DateTime } from 'luxon';
import { Secrets, getAddressString} from 'ehr-utils';
import { SecretsKeys, getAuth0Token, getSecret } from '../shared';
import { getPatientFromAppointment } from '../shared/appointment/helpers';
import { getChatRoomResourceExtension } from '../shared/helpers';
import { getRelatedPersonForPatient } from '../shared/patients';
import { getPractitionerResourceForUser } from '../shared/practitioners';
import { CreateTelemedChatRoomResponse } from '../shared/types/telemed/chat-room.types';
import { v4 as uuidv4 } from 'uuid';
import { Body } from 'node-fetch';

export const createChatRoom = async (
  appointment: Appointment,
  currentVideoEncounter: Encounter,
  fhirClient: FhirClient,
  userId: User['id'],
  secrets: Secrets | null,
  appClient: AppClient,
  createEncounter: boolean
): Promise<CreateTelemedChatRoomResponse['encounter']> => {
  const patientId = getPatientFromAppointment(appointment);
  if (!patientId) {
    throw new Error(`Pateint id not defined on appointment ${appointment.id}`);
  }
  let encounter;

  const relatedPerson = await getRelatedPersonForPatient(patientId, fhirClient);

  const practitioner = await getPractitionerResourceForUser(userId, fhirClient, appClient);

  
  if(createEncounter) {
    const token = await getAuth0Token(secrets);

    encounter = await createsChatRoomEncounter(
        patientId,
        practitioner.id!, 
        relatedPerson,
        currentVideoEncounter.location,
        appointment.id,
        token,
        secrets
    ) as Encounter;
  } else {
    encounter = currentVideoEncounter;
  }
  
  const updatedEncounter = updateChatRoomEncounter(encounter)

  console.log("What is the updated encounter?");
  console.debug(JSON.stringify(updatedEncounter));

  const chatRoomEncounterResource = await execCreateChatRoomRequest(secrets, updatedEncounter);

  // Update Chat Room Participants
  updateChatRoomParticipants(
    secrets,
    chatRoomEncounterResource.id,
    practitioner.id,
    patientId,
    getAddressString(chatRoomEncounterResource) as string
  );

  return chatRoomEncounterResource as CreateTelemedChatRoomResponse['encounter'];
};

const execCreateChatRoomRequest =  async (
  secrets: Secrets | null,
  encounter: Encounter,
): Promise<CreateTelemedChatRoomResponse['encounter']> => {
  const token = await getAuth0Token(secrets);
  
  const response = await fetch(`${getSecret(SecretsKeys.PROJECT_API, secrets)}/messaging/conversation`, {
    body: JSON.stringify({ encounter: encounter }),
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: 'POST',
  });

  if (!response.ok) {
    console.debug(await response.json());
    throw new Error(`Request failed to create a chat room: ${response.statusText}`);
  }

  let data = await response.json();

  const responseData = data as CreateTelemedChatRoomResponse;

  console.debug(responseData);

  return responseData.encounter;
};

const updateChatRoomParticipants = async (secrets: Secrets | null, encounter: string, practitioner: string, patientId: string, conversationId: string) : Promise<object> => {
    
    const token = await getAuth0Token(secrets);

    const response = await fetch(`${getSecret(SecretsKeys.PROJECT_API, secrets)}/messaging/conversation/${conversationId}/participant`, {
        body: JSON.stringify({ 
            encounterReference: `Encounter/${encounter}`,
            participants: [
                {
                    participantReference: `Practitioner/${practitioner}`,
                    channel: 'chat',
                },
                {
                    participantReference: `Patient/${patientId}`,
                    channel: "chat"
                }
            ],
         }),
        headers: {
            Authorization: `Bearer ${token}`,
            'x-zapehr-project-id': '658f1e23-ed46-4b0e-b26b-34ad923d209d'
        },
        method: 'POST',
    });

    if (response.status != 204) {
      console.debug(await response.json());
      throw new Error(`Request failed to create a chat room participants: ${response.statusText}`);
    }

    return {
      succussful: true
    };
}

const createsChatRoomEncounter = async (
    patientId: string,
    practitionerId: string,
    relatedPerson: RelatedPerson,
    locationResource: EncounterLocation,
    appointment: string,
    token: string,
    secrets: Secrets | null,
): Promise<object> => {
    let encounter = {
        id: uuidv4(),
        resourceType: "Encounter",
        text: {
            status: "generated",
            div: "<div xmlns=\"http://www.w3.org/1999/xhtml\">Encounter with patient via Twilio</div>"
        },
        subject: {
            reference: `Patient/${patientId}`
        },
        appointment: [
            {
                reference: `Appointment/${appointment}`
            }
        ],
        participant: [
            {
                individual: {
                    reference: `Practitioner/${practitionerId}`,
                }
            }
        ],
        status: 'in-progress',
        class: {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "VR",
            display: "virtual"
        },
        location: locationResource,
        extension: [
            {
                url: "https://extensions.fhir.zapehr.com/encounter-other-participants",
                extension: [
                    {
                        url: "https://extensions.fhir.zapehr.com/encounter-other-participant",
                        extension: [
                            {
                                url: "reference",
                                valueReference: {
                                    reference: `Patient/${patientId}`
                                }
                            }
                        ]
                    }
                ]
            }
        ]

    };

    console.log(JSON.stringify(encounter));

    const url = 'https://fhir-api.zapehr.com/r4b/Encounter';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
            'x-zapehr-project-id': '658f1e23-ed46-4b0e-b26b-34ad923d209d'
        },
        body: JSON.stringify(encounter)
    };

    let res = await fetch(url,options);

    if(!res.ok) {
        let message = await res.json();

        console.log(JSON.stringify(message));
        throw new Error('Issue creating encounter');
    }

    console.log(await res.json());

    return encounter;

}

const updateChatRoomEncounter = (
  encounter: Encounter,
  startTime: DateTime = DateTime.now(),
): Encounter => {
  encounter.status = 'in-progress';
  const startTimeIso = startTime.toUTC().toISO()!;

  encounter.statusHistory ??= [];

  const previousStatus = encounter.statusHistory?.[encounter.statusHistory?.length - 1];
  if (previousStatus) {
    previousStatus.period = {
      ...previousStatus.period,
      end: startTimeIso!,
    };
  }

  encounter.statusHistory?.push({
    status: encounter.status,
    period: {
      start: startTimeIso!,
    },
  });

  return encounter;
};
