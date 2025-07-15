import Oystehr, { FhirSearchParams } from '@oystehr/sdk';
import { Appointment, Encounter, Location, Patient, QuestionnaireResponse, RelatedPerson, Resource } from 'fhir/r4b';
import { getVideoRoomResourceExtension, OTTEHR_MODULE, removePrefix } from 'utils';

export type EncounterToAppointmentIdMap = { [appointmentId: string]: Encounter };
export type QuestionnaireResponseToAppointmentIdMap = { [encounterId: string]: QuestionnaireResponse };

export function filterTelemedVideoEncounters(allResources: Resource[]): EncounterToAppointmentIdMap {
  const result: EncounterToAppointmentIdMap = {};
  allResources.forEach((resource) => {
    if (!(resource.resourceType === 'Encounter' && getVideoRoomResourceExtension(resource))) return;
    const encounter = resource as Encounter;

    const appointmentReference = encounter?.appointment?.[0].reference || '';
    const appointmentId = removePrefix('Appointment/', appointmentReference);
    if (appointmentId) result[appointmentId] = encounter;
  });
  return result;
}

export function filterTelemedQuestionnaireResponses(allResources: Resource[]): QuestionnaireResponseToAppointmentIdMap {
  const result: QuestionnaireResponseToAppointmentIdMap = {};
  allResources.forEach((resource) => {
    if (resource.resourceType != 'QuestionnaireResponse') return;
    const questionnaireResponse = resource as QuestionnaireResponse;

    const encounterReference = questionnaireResponse?.encounter?.reference || '';
    const encounterId = removePrefix('Encounter/', encounterReference);
    if (encounterId) result[encounterId] = questionnaireResponse;
  });
  return result;
}

export async function getFhirResources(
  oystehr: Oystehr,
  patientIDs: string[],
  patientID?: string
): Promise<Resource[]> {
  const fhirSearchParams: FhirSearchParams<Appointment | Encounter | Location | Patient | RelatedPerson> = {
    resourceType: 'Appointment',
    params: [
      { name: '_tag', value: OTTEHR_MODULE.TM },
      {
        name: 'patient',
        value: patientID ? `Patient/${patientID}` : patientIDs.join(','),
      },
      {
        name: '_include',
        value: 'Appointment:patient',
      },
      {
        name: '_revinclude:iterate',
        value: 'RelatedPerson:patient',
      },
      {
        name: '_revinclude:iterate',
        value: 'Encounter:participant',
      },
      {
        name: '_revinclude:iterate',
        value: 'Encounter:appointment',
      },
      {
        name: '_revinclude:iterate',
        value: 'QuestionnaireResponse:encounter',
      },
      {
        name: '_include',
        value: 'Appointment:location',
      },
      // {
      //   name: '_revinclude:iterate',
      //   value: 'DocumentReference:patient',
      // // },
      
    ],
  };
  const bundle = await oystehr.fhir.search<Appointment | Encounter | Location | Patient | RelatedPerson | QuestionnaireResponse>(
    fhirSearchParams
  );

  return bundle.unbundle();
}
