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
        projectId: "658f1e23-ed46-4b0e-b26b-34ad923d209d",
        accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRRc2xGbWlRX01ZTzg4Z3BRUnlvRCJ9.eyJpc3MiOiJodHRwczovL2F1dGguemFwZWhyLmNvbS8iLCJzdWIiOiJhdXRoMHw2NWQzODUxMTFjMWNkOTA1MDI5MjA4NzIiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuemFwZWhyLmNvbSIsImh0dHBzOi8vemFwZWhyLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NTQwNzA5MzMsImV4cCI6MTc1NDE1NzMzMywic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6Im8zcnN6bDJuS0k2STFhSDZzYmw4ZEZyRmdNVkcyaU1jIn0.tGZRfEUNGwQpE6SmNeZ8B0ahF5pNBx55WAlPLh8dqlfoVWNMLnAdJE1T38xW1drVSXszzxZ2ireqpfulAexZ3TodIlhOCKcsbZTrak0MyiGJ94maZXeu0AKZJC9_KXaBOWogQQvbvzmOh65ZiYS8rmOsslmFIfp0UvAHfZnuIubkvAho5l_qqPvoLK6ded6xpk5Oia3_YdZb_SoNLicI8JUXT5paqf4aXlwNEocK8oe4KEPntPcQu1qEx47DzgVvTPqFjh_-Tzz1cGdgB6LMzss-EsAirL7Mx09p0kj5VP0jalSe7YrHPzbrazhDyj9ibFRfEaWQPSFpiHZlozj6Lw',
        fhirApiUrl: 'https://fhir-api.zapehr.com',
    });

    let zambdas = await oystehr.zambda.list();

    for(const zambda of zambdas) {
        console.log(zambda)

       await oystehr.zambda.delete({
        id:zambda.id
    });
    }

};

runCleanup();