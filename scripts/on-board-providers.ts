import Oystehr from '@oystehr/sdk';
import dotenv from 'dotenv';
import Stripe from 'stripe';

import { Location, Person, Practitioner } from 'fhir/r4b';
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

function ensureTelecomFields(telecom) {
  if (!Array.isArray(telecom)) telecom = [];

  // Find phone number
  const phoneEntry = telecom.find((t) => t.system === 'phone');
  const phoneValue = phoneEntry?.value;

  // Ensure fax is set to (813) 212-6732
  const faxIndex = telecom.findIndex((t) => t.system === 'fax');
  if (faxIndex === -1) {
    telecom.push({ system: 'fax', value: '(813) 212-6732' });
  } else {
    telecom[faxIndex].value = '(813) 212-6732';
  }

  // Ensure sms is set to same value as phone
  if (phoneValue) {
    const smsIndex = telecom.findIndex((t) => t.system === 'sms');
    if (smsIndex === -1) {
      telecom.push({ system: 'sms', value: phoneValue });
    } else {
      telecom[smsIndex].value = phoneValue;
    }
  } else {
    console.warn('No phone number found — cannot sync sms value.');
  }

  return telecom;
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

    let counter = 0;
    let goodRecords = 0;
    let badRecords: string[] = [];

    const oystehr = new Oystehr({
        accessToken: jsonResponse.access_token,
        fhirApiUrl: 'https://fhir-api.zapehr.com',
    });

    const searchResults = (
        await oystehr.fhir.search<Person>({
            resourceType: 'Person',
            params: [
            { name: '_count', value: '1000' }
            ]
        })
    ).unbundle();

    const personResults = searchResults.filter((person) => {
        const identifiers = person.identifier || [];
        return identifiers.some(
            (id) => id.system === 'http://hl7.org/fhir/sid/us-npi'
        );
    });


    for(const person of personResults) {
        const existingTags = person.meta?.tag || [];
        const hasTransferredTag = existingTags.some(
            tag => tag.system === 'https://fhir.api.hlthi.life/v1/physician-transferred' && tag.code === 'true'
        );

        const tags = person.meta?.tag ?? [];

        const hasTag = (system: string, code: string) =>
            tags.some((tag) => tag.system === system && tag.code === code);

        const allRequiredTagsPresent =
            hasTag('https://fhir.api.hlthi.life/v1/contract-signed', 'true') &&
            hasTag('https://fhir.api.hlthi.life/v1/contract-sent', 'true') &&
            hasTag('https://fhir.api.hlthi.life/v1/physician-paid', 'true') &&
            hasTag('https://fhir.api.hlthi.life/v1/physician-transferred', 'false') &&
            hasTag('https://fhir.api.hlthi.life/v1/stripe-connected-account-ready', 'true');

        if(hasTransferredTag) {
            continue;
        }

        if(!allRequiredTagsPresent) {
            continue;
        }

        const getIdentifierValue = (system: string) =>
                person.identifier?.find((v) => v.system === system)?.value;

            const qualificationUrl = 'https://api.hlthi.life/api/qualifications';

            // 1. Extract the extension containing qualifications
            const qualificationExt = person.extension?.find(
                (ext) => ext.url === qualificationUrl
            );

            let qualifications: Practitioner['qualification'] = [];

            if (qualificationExt?.valueString) {
                try {
                    qualifications = JSON.parse(qualificationExt.valueString);
                } catch (e) {
                    console.error('Invalid qualification JSON in Person.extension:', e);
                }
            }

            // 3. Filter out the qualifications extension from the Person
            const filteredExtensions = person.extension?.filter(
                (ext) => ext.url !== qualificationUrl
            );

            const practitioner: Practitioner = {
                resourceType: 'Practitioner',
                active: true,
                meta: {
                    tag: [
                        {
                            code: "true",
                            system: "https://fhir.api.hlthi.life/v1/subcription-active"
                        },
                        {
                            code: "false",
                            system: "https://fhir.api.hlthi.life/v1/disabled-account"
                        },
                        {
                            code: "false",
                            system: "https://fhir.api.hlthi.life/v1/request-for-audit"
                        }
                    ]
                },
                identifier: [
                    {
                        system: 'http://hl7.org/fhir/sid/us-npi',
                        value: getIdentifierValue('http://hl7.org/fhir/sid/us-npi'),
                    },
                    {
                        system: 'https://api.stripe.com/v1/customer',
                        value: getIdentifierValue('https://api.stripe.com/v1/customer'),
                    },
                    {
                        system: 'http://terminology.hl7.org/NamingSystem/USDEANumber',
                        value: getIdentifierValue('http://terminology.hl7.org/NamingSystem/USDEANumber'),
                    },
                    {
                        system: 'https://api.stripe.com/v1/connected-account',
                        value: getIdentifierValue('https://api.stripe.com/v1/connected-account'),
                    },
                ],
                name: person.name,
                gender: person.gender,
                birthDate: person.birthDate,
                telecom: ensureTelecomFields(person.telecom),
                address: person.address,
                extension: filteredExtensions,
                qualification: qualifications
            };

            const email = person.telecom?.find((contact) => contact.system === 'email')?.value;
            const phone = person.telecom?.find((contact) => contact.system === 'phone')?.value;
            
            try {
                const createdPractitioner = await oystehr.user.invite({
                        username: email!,
                        email: email!,
                        phoneNumber: phone!.replace(/\s+/g, ''),
                        applicationId: 'b576cc2a-f623-4918-b50d-24116a98fb32',
                        resource: practitioner,
                        roles: [
                            'b444da8d-620e-4bcb-849a-046190931067'
                        ]
                    });

                    const stripeApiKey = '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';
                    const stripe = new Stripe(stripeApiKey);

                    try {
                        await stripe.accounts.update(getIdentifierValue('https://api.stripe.com/v1/connected-account')!, {
                            metadata: {
                                account_FHIR: createdPractitioner.profile,
                            },
                        });

                        await stripe.customers.update(getIdentifierValue('https://api.stripe.com/v1/customer')!, {
                            metadata: {
                                account_FHIR: createdPractitioner.profile,
                            },
                        });
                    } catch(e) {
                        console.log(e);
                        console.log(person.id);
                    }

                     
                    // // Step 2: Modify the specific tag
                
                    const updatedTags = existingTags.map(tag => {
                        if (tag.system === 'https://fhir.api.hlthi.life/v1/physician-transferred') {
                            return { ...tag, code: 'true' };
                        }
                        return tag;
                    });

                    try {
                        // Step 3: Patch the full tag array
                        await oystehr.fhir.patch({
                            resourceType: 'Person',
                            id: person.id!,
                            operations: [
                                {
                                op: 'replace',
                                path: '/meta/tag',
                                value: updatedTags
                                }
                            ]
                        });

                        const jsonResponse2 = await (await fetch(`https://erx-api.zapehr.com/v3/practitioner/${createdPractitioner.profile.split('/')[1]}`, {
                            method: 'POST',
                            headers: {
                                'authorization': `Bearer ${jsonResponse.access_token}`,
                                'x-oystehr-project-id': '4a44d30b-6200-4256-9a36-63bde08c2cd7'
                            }
                        }));
                    } catch(e) {
                        console.log(e);
                        console.log(person.id)
                    }

            } catch(e) {
                console.log(e);
                 console.log(person.id);
            }
           

            
           
            

    }

};

runCleanup();