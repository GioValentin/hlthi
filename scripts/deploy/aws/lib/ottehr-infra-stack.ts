import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import config from '../../deploy-config.json';

export class OttehrInfraStack extends cdk.Stack {
  patientPortalBucket: s3.Bucket;
  patientPortalDistribution: cloudfront.Distribution;
  ehrBucket: s3.Bucket;
  ehrDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!('project_id' in config)) {
      throw new Error('project_id is required in config file');
    }

    const projectConfig: any = config;
    const projectIdentifier = projectConfig.project_id;

    const domain = 'domain' in projectConfig ? projectConfig.domain : 'ottehr.com';
    const patientPortalSubdomain = 'intake_subdomain' in projectConfig ? projectConfig.intake_subdomain : 'intake';
    const ehrSubdomain = 'ehr_subdomain' in projectConfig ? projectConfig.ehr_subdomain : 'ehr';

    this.patientPortalBucket = createWebsiteBucket(
      this,
      `patientPortal`,
      projectIdentifier,
      domain,
      patientPortalSubdomain
    );
    this.ehrBucket = createWebsiteBucket(this, `ehr`, projectIdentifier, domain, ehrSubdomain);
    this.patientPortalDistribution = setUpCloudFront(
      this,
      `patientPortal`,
      this.patientPortalBucket,
      projectIdentifier,
      projectConfig.intake_domain
    );
    this.ehrDistribution = setUpCloudFront(this, `ehr`, this.ehrBucket, projectIdentifier, projectConfig.ehr_domain);
  }
}

function createWebsiteBucket(
  scope: Construct,
  website: 'patientPortal' | 'ehr' | string,
  projectIdentifier: string,
  domain: string,
  subdomain: string
): s3.Bucket {
  return new s3.Bucket(scope, `create-${website}-s3-bucket`, {
    publicReadAccess: true,
    websiteIndexDocument: 'index.html',
    websiteErrorDocument: 'index.html',
    blockPublicAccess: {
      blockPublicAcls: true,
      blockPublicPolicy: false,
      ignorePublicAcls: true,
      restrictPublicBuckets: false,
    },
    bucketName: `ottehr-${projectIdentifier}-${subdomain}.${domain}`,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  });
}

function setUpCloudFront(
  scope: Construct,
  website: 'patientPortal' | 'ehr' | string,
  bucket: s3.Bucket,
  projectId: string,
  domainName: string
): cloudfront.Distribution {

  const certificate = acm.Certificate.fromCertificateArn(
    scope,
    `ProviderCertificate-${website}`,
    'arn:aws:acm:us-east-1:905418388478:certificate/35e35201-b33a-4934-816d-0553322abf76'
  );

  return new cloudfront.Distribution(scope, `create-${website}-cloudfront-distribution`, {
    defaultBehavior: {
      origin: new cloudfront_origins.S3Origin(bucket),
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
    },
    domainNames: [domainName], // e.g., 'provider.hlthi.life'
    certificate,
    comment: `ottehr-${website}-${projectId} - redeployed at ${new Date().toISOString()}`
  });
}
