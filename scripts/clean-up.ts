import Oystehr from '@oystehr/sdk';
import dotenv from 'dotenv';
import { Location, Practitioner } from 'fhir/r4b';
import fs from 'fs';
import { allLicensesForPractitioner, makeQualificationForPractitioner } from 'utils';
import { isLocationVirtual } from 'utils/lib/fhir/location';

dotenv.config();

function isValidDEALength(deaNumber) {
  return deaNumber.length === 9;
}

function isValidSSN(ssn) {
  return /^(?!000|666|9\d{2})\d{3}(?!00)\d{2}(?!0000)\d{4}$/.test(ssn);
}

function isValidNPILength(npi) {
  return /^\d{10}$/.test(npi);
}

async function validateNPI(npi) {
  const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.results && data.results.length > 0;
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

const runCleanup = async () => {

    const oystehr = new Oystehr({
        projectId: "4a44d30b-6200-4256-9a36-63bde08c2cd7",
        accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRRc2xGbWlRX01ZTzg4Z3BRUnlvRCJ9.eyJpc3MiOiJodHRwczovL2F1dGguemFwZWhyLmNvbS8iLCJzdWIiOiJhdXRoMHw2NWQzODUxMTFjMWNkOTA1MDI5MjA4NzIiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuemFwZWhyLmNvbSIsImh0dHBzOi8vemFwZWhyLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NTUxMTczOTQsImV4cCI6MTc1NTIwMzc5NCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6Im8zcnN6bDJuS0k2STFhSDZzYmw4ZEZyRmdNVkcyaU1jIn0.KzDvlgSSU1HOY3xdZxctoLwCfbsbcuY6iVhB1BCjROWd8LAffHiJYr9jimye5HGXY-P29a3kUdC-qbcImzkeJ7J0iIXp4ImkKVBOPrxYrTSeqgVbfP2d5uWlIOYm3Z5Q_0V1NQ2vWw_86jcj3PlHgiKirl7LYZz5OwPqBknMKeX6C1BkwwR3kZVA0IO4dpNW0RTeeYfUDODLx1DtJY5W6MYm_7ym5NwY6qk4Is2xK1Epf2nL7BE1jj7bhdFKUXO2kZMsQWkRkfwg6a_vYmjbn_IQ79xWA1TU3mKsp6cCcL08OEHsL6_n0FXLkYaXGCiXp1pn1Owlql8rhYdWd-wt4w',
        fhirApiUrl: 'https://fhir-api.zapehr.com',
    });

    // Missing states and names
    const states = [
      ["WV", "West Virginia"]
    ];

    // Timezone mapping
    const tzMap = {
      "AK": "America/Anchorage",
      "HI": "Pacific/Honolulu",
      "ID": "America/Boise",
      "MT": "America/Denver",
      "UT": "America/Denver",
      "OR": "America/Los_Angeles",
      "NM": "America/Denver",
      "SD": "America/Chicago",
      "KS": "America/Chicago",
    };
    const defaultTz = "America/New_York";

    // Build the FHIR batch Bundle
    const requests = states.map(([abbr, full]) => ({
      method: "POST",
      url: "Location",
      resource: {
        resourceType: "Location",
        status: "active",
        address: { state: abbr },
        extension: [
          {
            url: "https://extensions.fhir.zapehr.com/location-form-pre-release",
            valueCoding: {
              system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
              code: "vi",
              display: "Virtual"
            }
          },
          {
            url: "http://hl7.org/fhir/StructureDefinition/timezone",
            valueString: tzMap[abbr] || defaultTz
          }
        ],
        identifier: [
          {
            system: "https://fhir.ottehr.com/r4/slug",
            value: `Telemed${full.replace(/\s+/g, '')}`
          }
        ],
        type: [
          {
            coding: [
              {
                system: "https://fhir.pmpediatriccare.com/r4/location-code",
                code: `${abbr}TELE`
              }
            ]
          }
        ],
        name: `Telemed ${full}`,
        hoursOfOperation: [
          {
            openingTime: "00:00:01",
            closingTime: "23:59:59",
            daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
          }
        ]
      }
    }));

    const response = await oystehr.fhir.transaction({requests});

};

runCleanup();