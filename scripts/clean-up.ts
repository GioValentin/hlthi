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

    const jsonResponse = await (await fetch('https://auth.zapehr.com/oauth/token', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: 'aHIMQd3Z7neJOUabd2iTdDa9RIDgLqMs',
            client_secret: 'cTbcXeuukkXTMjf8v9y9w6xGmKej_lQRJObDlURmXQm9zEzYEowZp0vEWhpUdbTr',
            audience: 'https://api.zapehr.com',
        }),
    })).json();

    const data = fs.readFileSync('./records.jsonl', 'utf-8');
    const lines = data.split('\n').filter(Boolean);
    let counter = 0;
    let goodRecords = 0;
    let badRecords: string[] = [];

    const oystehr = new Oystehr({
        accessToken: jsonResponse.access_token,
        fhirApiUrl: 'https://fhir-api.zapehr.com',
    });

    for (const line of lines) {
        const record = JSON.parse(line);

        let flowId = record['Flow ID'];
        let id = record['ID'];

        delete record['ID'];
        delete record['Flow ID'];

        record['First Name'] = capitalizeWords(record['First Name']);
        record['Last Name'] = capitalizeWords(record['Last Name']);

        const payload = {
            "flowID": flowId,
            "id": id,
            "fields": {
                ...record
            }
        }

        let users = await oystehr.user.listV2({
            'email': record['Primary Email Address']
        });

        let userId = users?.data[0]?.id;
        let practitionerProfileId = users?.data[0]?.profile
        
        // Try with emergency contact email
        if(userId == undefined || practitionerProfileId == undefined) {

            users = await oystehr.user.listV2({
                'email': record['Emergency Contact Email']
            });

            userId = users?.data[0]?.id;
            practitionerProfileId = users?.data[0]?.profile

            if(userId != undefined || practitionerProfileId != undefined) {
                console.info("Found user with " + record['Emergency Contact Email']);
            }

        } else {

            try {
                await oystehr.user.delete({
                    id: userId
                });
            } catch(e) {
                console.log(`Could not delete user ${record['Primary Email Address']}`);

            }

            try {
                await oystehr.fhir.delete({
                    resourceType: "Practitioner",
                    id: practitionerProfileId.split('/')[1]
                });
            } catch(e) {
                console.log("Couldn't Delete FHIR account");
            }
                
        }

        if(
            record['SSN'] == '***deleted***' ||
            record['ProviderDEALicenseNumber'] == '***deleted***' || 
            isValidDEALength(record['ProviderDEALicenseNumber']) == false || 
            isValidSSN(record['SSN']) == false ||
            isValidNPILength(record['NPI']) == false ||
            await validateNPI(record['NPI']) == false 
        ) {
            badRecords.push(record['Primary Email Address']);
        } else {
            
            try {
                let request = await fetch('https://project-api.zapehr.com/v1/zambda/custom-onboard-provider/execute', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'x-oystehr-project-id': '4a44d30b-6200-4256-9a36-63bde08c2cd7',
                    'Authorization': 'Bearer ' + jsonResponse.access_token
                    },
                    body: JSON.stringify({
                        action: 'create-practitioner',
                        data: payload
                    })
                });
            } catch(e) {
                console.log(e);
            }

        }

    }

    console.log(JSON.stringify(badRecords));

};

runCleanup();