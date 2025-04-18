import Oystehr, { User } from '@oystehr/sdk';
import { Encounter, Person, RelatedPerson } from 'fhir/r4b';
import { PatientInfo } from 'utils';

export const createEncounterForConversation = async (
  oystehr: Oystehr,
  relatedPerson: RelatedPerson,
  deviceID: string
): Promise<Encounter> => {
  return await oystehr.fhir.create<Encounter>({
    resourceType: 'Encounter',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'VR', // Virtual
    },
    participant: [
      {
        individual: {
          reference: `RelatedPerson/${relatedPerson.id}`,
        },
      },
    ],
    extension: [
      {
        url: 'https://extensions.fhir.zapehr.com/encounter-other-participants',
        extension: [
          {
            url: 'https://extensions.fhir.zapehr.com/encounter-other-participant',
            extension: [
              {
                url: 'reference',
                valueReference: {
                  reference: `Device/${deviceID}`,
                },
              },
            ],
          },
        ],
      },
    ],
  });
};

export const createConversation = async (
  projectApiURL: string,
  zapehrToken: string,
  encounter: Encounter
): Promise<Response> => {
  return await fetch(`${projectApiURL}/messaging/conversation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${zapehrToken}`,
    },
    body: JSON.stringify({
      encounter: encounter,
    }),
  });
};

export const addParticipantsToConversation = async (
  projectApiURL: string,
  conversationSID: string,
  zapehrToken: string,
  encounter: Encounter,
  deviceID: string,
  person: Person,
  user: User,
  patient: PatientInfo
): Promise<Response> => {
  return await fetch(`${projectApiURL}/messaging/conversation/${conversationSID}/participant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${zapehrToken}`,
    },
    body: JSON.stringify({
      encounterReference: `Encounter/${encounter.id}`,
      participants: [
        {
          participantReference: `Device/${deviceID}`,
          channel: 'chat',
        },
        {
          participantReference: `Person/${person.id}`,
          channel: 'sms',
          phoneNumber: user.name.startsWith('+')
            ? person.telecom?.find((telecomTemp) => telecomTemp.system === 'phone')?.value
            : patient.phoneNumber,
        },
      ],
    }),
  });
};

export const getEncountersForRelatedPersons = async (
  oystehr: Oystehr,
  relatedPersonIDs: string[]
): Promise<Encounter[]> => {
  return (
    await oystehr.fhir.search<Encounter>({
      resourceType: 'Encounter',
      params: [
        {
          name: 'participant',
          value: relatedPersonIDs.join(','),
        },
        {
          name: 'class',
          value: 'VR',
        },
      ],
    })
  ).unbundle();
};

export const addRelatedPersonToEncounter = async (
  oystehr: Oystehr,
  encounterId: string,
  relatedPerson: RelatedPerson
): Promise<Encounter> => {
  return await oystehr.fhir.patch<Encounter>({
    resourceType: 'Encounter',
    id: encounterId,
    operations: [
      {
        op: 'add',
        path: '/participant/0',
        value: {
          individual: {
            reference: `RelatedPerson/${relatedPerson.id}`,
          },
        },
      },
    ],
  });
};
