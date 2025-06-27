#!/usr/bin/env node
import { CloudFrontClient, ListDistributionsCommand, ListDistributionsCommandOutput } from '@aws-sdk/client-cloudfront';
import { fromIni } from '@aws-sdk/credential-providers';
import Oystehr from '@oystehr/sdk';
import config from '../../deploy-config.json';
import { updateEnvFiles, updateZapehr } from '../../helpers';

const projectConfig: any = config;
const environment = projectConfig.environment;
const projectId = projectConfig.project_id;
const accessToken = projectConfig.access_token;
const ehrDomain = projectConfig.ehr_domain;
const patientDomain = projectConfig.intake_domain;

void (async () => {
  try {
    const distributions = await getCloudFrontDistributions();
    const patientPortalDistribution = distributions.DistributionList?.Items?.find(
      (distribution: any) => distribution.Comment === `ottehr-patientPortal-${projectId}`
    );
    const ehrDistribution = distributions.DistributionList?.Items?.find(
      (distribution: any) => distribution.Comment === `ottehr-ehr-${projectId}`
    );
    if (patientPortalDistribution && ehrDistribution) {
      const patientPortalUrl = patientDomain;
      const ehrUrl = ehrDomain;
      console.log('Portals', patientPortalUrl, ehrUrl);
      const oystehr = new Oystehr({
        accessToken,
        projectId,
      });
      await updateEnvFiles(environment, patientDomain, ehrDomain);
      //await updateBuildFiles('ehr');
      //await updateBuildFiles('intake');
      await updateZapehr(oystehr, [patientPortalUrl,`https://${patientPortalDistribution.DomainName}`], [ehrUrl,`https://${ehrDistribution.DomainName}`]);
    }
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
})();

export async function getCloudFrontDistributions(): Promise<ListDistributionsCommandOutput> {
  const cloudfrontClient = new CloudFrontClient({ region: 'us-east-1', credentials: fromIni({ profile: 'ottehr' }) });
  return await cloudfrontClient.send(new ListDistributionsCommand({}));
}
