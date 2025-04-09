import Oystehr from '@oystehr/sdk';
import { wrapHandler } from '@sentry/aws-serverless';
import { APIGatewayProxyResult } from 'aws-lambda';
import { HealthcareService, Location, Practitioner } from 'fhir/r4b';
import { DateTime } from 'luxon';
import {
  AvailableLocationInformation,
  GetScheduleResponse,
  SecretsKeys,
  getAvailableSlotsForSchedules,
  getOpeningTime,
  getScheduleDetails,
  getSecret,
  getWaitingMinutesAtSchedule,
  isLocationOpen,
  isWalkinOpen,
} from 'utils';
import {
  captureSentryException,
  configSentry,
  createOystehrClient,
  getAuth0Token,
  getLocationInformation,
  getSchedules,
  topLevelCatch,
  ZambdaInput,
} from '../../shared';
import '../../shared/instrument.mjs';
import { validateRequestParameters } from './validateRequestParameters';

// Lifting up value to outside of the handler allows it to stay in memory across warm lambda invocations
let zapehrToken: string;
export const index = wrapHandler(async (input: ZambdaInput): Promise<APIGatewayProxyResult> => {
  configSentry('get-schedule', input.secrets);
  console.log('this should get logged out if the zambda has been deployed');
  console.log(`Input: ${JSON.stringify(input)}`);

  try {
    console.group('validateRequestParameters');
    const validatedParameters = validateRequestParameters(input);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { secrets, scheduleType, slug, specificSlot } = validatedParameters;
    console.groupEnd();
    console.debug('validateRequestParameters success');

    if (!zapehrToken) {
      console.log('getting token');
      zapehrToken = await getAuth0Token(secrets);
    } else {
      console.log('already have token', zapehrToken);
    }

    const oystehr = createOystehrClient(zapehrToken, secrets);
    if (!oystehr) {
      throw new Error('error initializing fhir client');
    }

    console.time('get-schedule-from-slug');
    const scheduleData = await getSchedules(oystehr, scheduleType, slug);
    const { scheduleList, owner, metadata } = scheduleData;
    console.timeEnd('get-schedule-from-slug');
    const now = DateTime.now();

    console.log('groupItems retrieved from getScheduleUtil:', JSON.stringify(scheduleList, null, 2));
    console.log('owner retrieved from getScheduleUtil:', JSON.stringify(owner, null, 2));
    console.log('scheduleMetaData', JSON.stringify(metadata, null, 2));

    const DISPLAY_TOMORROW_SLOTS_AT_HOUR = parseInt(
      getSecret(SecretsKeys.IN_PERSON_PREBOOK_DISPLAY_TOMORROW_SLOTS_AT_HOUR, secrets)
    );

    /*
    todo when Zap supports the near param
    const nearbyLocations: Location = [];

    const latitude = location.position?.latitude;
    const longitude = location.position?.longitude;
    if (latitude && longitude && location.id) {
      console.log('searching for locations near', latitude, longitude);
      const nearbyLocationSearchResults: Location[] = await oystehr.searchResources({
        resourceType: 'Location',
        searchParams: [
          { name: 'near', value: `${latitude}|${longitude}|20.0|mi_us` },
          // { name: '_id:not-in', value: location.id },
        ],
      });
      console.log('nearbyLocationSearchResults', nearbyLocationSearchResults.length);
    }*/

    console.log('organizing location information for response');
    const locationInformationWithClosures: AvailableLocationInformation = getLocationInformationWithClosures(
      oystehr,
      owner,
      now
    );

    console.log('getting wait time based on longest waiting patient at location');
    console.time('get_waiting_minutes');
    const waitingMinutes = await getWaitingMinutesAtSchedule(oystehr, now, owner);
    console.timeEnd('get_waiting_minutes');
    console.time('synchronous_data_processing');
    const { telemedAvailable, availableSlots } = await getAvailableSlotsForSchedules({
      now: DateTime.now(),
      scheduleList,
    });
    console.timeEnd('synchronous_data_processing');

    const walkinOpen = isWalkinOpen(locationInformationWithClosures, now);
    const openTime = walkinOpen ? undefined : getNextOpeningDateTime(oystehr, now, owner);

    const response: GetScheduleResponse = {
      message: 'Successfully retrieved all available slot times',
      available: availableSlots,
      telemedAvailable,
      location: locationInformationWithClosures,
      displayTomorrowSlotsAtHour: DISPLAY_TOMORROW_SLOTS_AT_HOUR,
      waitingMinutes,
      walkinOpen,
      openTime,
    };

    console.log('response to return: ', response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    return topLevelCatch('get-schedule', error, input.secrets, captureSentryException);
  }
});

export function getNextOpeningDateTime(
  oystehr: Oystehr,
  now: DateTime,
  schedule: Location | Practitioner | HealthcareService
): string | undefined {
  const NUM_DAYS_TO_CHECK = 30;
  let day = 0;
  let nextOpeningTime: DateTime | undefined;
  while (day < NUM_DAYS_TO_CHECK && nextOpeningTime === undefined) {
    const nextOpeningDate = now.plus({ day });
    const locationInfo = getLocationInformation(oystehr, schedule, nextOpeningDate);
    if (isLocationOpen(locationInfo, nextOpeningDate)) {
      const maybeNextOpeningTime = getOpeningTime(locationInfo, nextOpeningDate);
      if (maybeNextOpeningTime && maybeNextOpeningTime > now) {
        nextOpeningTime = maybeNextOpeningTime;
      }
    }
    day++;
  }
  return nextOpeningTime?.setZone('utc').toFormat('HH:mm MM-dd-yyyy z');
}

function getLocationInformationWithClosures(
  oystehr: Oystehr,
  scheduleResource: Location | Practitioner | HealthcareService,
  currentDate: DateTime
): AvailableLocationInformation {
  const scheduleInformation: AvailableLocationInformation = getLocationInformation(
    oystehr,
    scheduleResource,
    currentDate
  );
  const schedule = getScheduleDetails(scheduleResource);
  const scheduleInformationWithClosures: AvailableLocationInformation = {
    ...scheduleInformation,
    closures: schedule?.closures ?? [],
  };
  return scheduleInformationWithClosures;
}
