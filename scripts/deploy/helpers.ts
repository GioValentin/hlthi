import Oystehr from '@oystehr/sdk';
import fs from 'fs/promises';
import config from './deploy-config.json';
import path from 'path';

const projectConfig: any = config;
const environment = projectConfig.environment;

export async function updateOystehr(oystehr: Oystehr, patientPortalUrl: string, ehrUrl: string): Promise<void> {
  const applications = await oystehr.application.list();
  const envPatientPortalFile = await fs.readFile(`${__dirname}/../../apps/intake/env/.env.${environment}`, 'utf8');
  const applicationPatientPortalClientID = envPatientPortalFile
    .split('\n')
    .find((item) => item.split('=')[0] === 'VITE_APP_CLIENT_ID')
    ?.split('=')[1];
  const patientPortalApplication = applications.find(
    (application) => application.clientId === applicationPatientPortalClientID
  );
  if (patientPortalApplication) {
    
    await oystehr.application.update({
      id: patientPortalApplication.id,
      loginRedirectUri: patientPortalUrl[0],
      allowedCallbackUrls: [patientPortalUrl[0], `${patientPortalUrl[0]}/redirect`,patientPortalUrl[1], `${patientPortalUrl[1]}/redirect`],
      allowedLogoutUrls: [patientPortalUrl[0], `${patientPortalUrl[0]}/redirect`,patientPortalUrl[1], `${patientPortalUrl[1]}/redirect`],
      allowedCORSOriginsUrls: [patientPortalUrl[0],patientPortalUrl[1]],
      allowedWebOriginsUrls: [patientPortalUrl[0],patientPortalUrl[1]],
      loginWithEmailEnabled: true,
      passwordlessSMS: false,
      refreshTokenEnabled: true,
      logoUri: 'https://cdn.prod.website-files.com/65abcf3c9867d80cb5c7372f/65abd75469c2257a1d66766f_svgexport-1.svg'
    });
    console.log('Updated patient portal application');
  }

  const envEHRFile =  await fs.readFile(`${__dirname}/../../apps/ehr/env/.env.${environment}`, 'utf8');
  const applicationEHRClientID = envEHRFile
    .split('\n')
    .find((item) => item.split('=')[0] === 'VITE_APP_OYSTEHR_APPLICATION_CLIENT_ID')
    ?.split('=')[1];
  const ehrApplication = applications.find((application: any) => application.clientId === applicationEHRClientID);
  if (ehrApplication) {
    await oystehr.application.update({
      id: ehrApplication.id,
      loginRedirectUri: ehrUrl[0],
      allowedCallbackUrls: [ehrUrl[0],ehrUrl[1]],
      allowedLogoutUrls: [ehrUrl[0],ehrUrl[1]],
      allowedCORSOriginsUrls: [ehrUrl[0],ehrUrl[1]],
      allowedWebOriginsUrls: [ehrUrl[0],ehrUrl[1]],
      loginWithEmailEnabled: true,
      passwordlessSMS: false,
      refreshTokenEnabled: true,
      logoUri: 'https://cdn.prod.website-files.com/65abcf3c9867d80cb5c7372f/65abd75469c2257a1d66766f_svgexport-1.svg'
    });
    console.log('Updated EHR application');
  }
}

export async function updateEnvFiles(environment: string, patientPortalUrl: string, ehrUrl: string): Promise<void> {
  console.log(__dirname);
  let patientPortalEnvFile = await fs.readFile(`${__dirname}/../../apps/intake/env/.env.${environment}`, 'utf8');
  patientPortalEnvFile = patientPortalEnvFile.replace(/paperwork\//g, '');
  patientPortalEnvFile = patientPortalEnvFile.replace(
    'http://localhost:3000/local',
    'https://project-api.zapehr.com/v1'
  );
  patientPortalEnvFile = patientPortalEnvFile.replace('VITE_APP_IS_LOCAL=true', 'VITE_APP_IS_LOCAL=false');

  let ehrEnvFile = await fs.readFile (`${__dirname}/../../apps/ehr/env/.env.${environment}`, 'utf8');
  ehrEnvFile = ehrEnvFile.replace('http://localhost:3000/local', 'https://project-api.zapehr.com/v1');
  ehrEnvFile = ehrEnvFile.replace('http://localhost:4000/local', 'https://project-api.zapehr.com/v1');
  ehrEnvFile = ehrEnvFile.replace('VITE_APP_IS_LOCAL=true', 'VITE_APP_IS_LOCAL=false');
  ehrEnvFile = ehrEnvFile.replace('VITE_APP_INTAKE_URL=http://localhost:3002', `VITE_APP_INTAKE_URL=${patientPortalUrl}`);
  
  ehrEnvFile = ehrEnvFile.replace(
    'VITE_APP_OYSTEHR_APPLICATION_REDIRECT_URL=http://localhost:4002',
    `VITE_APP_OYSTEHR_APPLICATION_REDIRECT_URL=${ehrUrl}`
  );

  ehrEnvFile = ehrEnvFile.replace('VITE_APP_QRS_URL=http://localhost:3002', `VITE_APP_QRS_URL=${patientPortalUrl}`);

  await fs.writeFile(`${__dirname}/../../apps/intake/env/.env.${environment}`, patientPortalEnvFile);
  await fs.writeFile(`${__dirname}/../../apps/ehr/env/.env.${environment}`, ehrEnvFile);
}

export async function updateBuildFiles(app: string): Promise<void> {
  const buildDir = path.resolve(__dirname, `../../apps/${app}/build`);
  console.log('Build directory:', buildDir);

  try {
    // Read the list of files in the build directory
    const files = await fs.readdir(buildDir);

    // Process each file
    for (const file of files) {
      const filePath = path.join(buildDir, file);
      const stats = await fs.stat(filePath);

      // Only update if it's a file (skip directories)
      if (stats.isFile()) {
        // Read file contents
        let fileContent = await fs.readFile(filePath, 'utf8');

        // Replace all occurrences of the target URL with the provided EHR URL
        const updatedContent = fileContent.replace(/http:\/\/localhost:3000\/local/g, 'https://project-api.zapehr.com/v1');

        // Write the updated content back to the file
        await fs.writeFile(filePath, updatedContent, 'utf8');
        console.log(`Updated file: ${filePath}`);
      }
    }
  } catch (err) {
    console.error('Error updating build files:', err);
    throw err;
  }
}