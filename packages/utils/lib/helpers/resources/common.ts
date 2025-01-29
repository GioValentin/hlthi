import { Appointment, Encounter } from 'fhir/r4';
import { PUBLIC_EXTENSION_BASE_URL } from '../../fhir';
import { TELEMED_VIDEO_ROOM_CODE } from '../../telemed/constants';
import { EncounterVirtualServiceExtension } from '../../types';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export const getVirtualServiceResourceExtension = (
  resource: Appointment | Encounter,
  code: typeof TELEMED_VIDEO_ROOM_CODE | 'twilio-conversations'
): EncounterVirtualServiceExtension | null => {
  let resourcePrefix: string;
  if (resource.resourceType === 'Appointment') {
    resourcePrefix = 'appointment';
  } else if (resource.resourceType === 'Encounter') {
    resourcePrefix = 'encounter';
  } else {
    return null;
  }

  for (let index = 0; index < (resource.extension?.length ?? 0); index++) {
    const extension = resource.extension?.[index];
    if (extension?.url !== `${PUBLIC_EXTENSION_BASE_URL}/${resourcePrefix}-virtual-service-pre-release`) {
      continue;
    }
    for (let j = 0; j < (extension?.extension?.length ?? 0); j++) {
      const internalExtension = extension.extension?.[j];
      if (internalExtension?.url === 'channelType' && internalExtension?.valueCoding?.code === code) {
        return extension as EncounterVirtualServiceExtension;
      }
    }
  }
  return null;
};

let _token: string | undefined = undefined;

export function useAuthToken(): string | undefined {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | undefined>(_token);

  useEffect(() => {
    if (isAuthenticated && !_token) {
      getAccessTokenSilently()
        .then((newToken) => {
          _token = newToken;
          setToken(newToken);
        })
        .catch(() => console.error('Unable to get auth0 token'));
    }
  }, [isAuthenticated, getAccessTokenSilently, setToken]);

  return token;
}

export const getAddressString = (data: any) => {
  // Navigate to the `extension` array in the data
  const extensions = data.extension || [];

  // Find the extension with the `url` for virtual service
  const virtualServiceExtension = extensions.find(
      (ext: any) =>
          ext.url ===
          "https://extensions.fhir.zapehr.com/encounter-virtual-service-pre-release"
  );

  if (virtualServiceExtension) {
      // Find the channelType and ensure it matches "twilio-conversations"
      const channelType = virtualServiceExtension.extension?.find(
          (subExt: any) =>
              subExt.url === "channelType" &&
              subExt.valueCoding?.code === "twilio-conversations"
      );

      if (channelType) {
          // Extract the addressString
          const addressStringExtension = virtualServiceExtension.extension.find(
              (subExt: any) => subExt.url === "addressString"
          );

          return addressStringExtension?.valueString || null;
      }
  }

  return null; // Return null if not found
};
