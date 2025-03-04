import { Address, ContactPoint, LocationHoursOfOperation } from 'fhir/r4';
import { Secrets } from '../secrets';

export interface FacilityGroup {
  address: string;
  city: string;
  state: string;
  zip: string;
  tel: string;
  fax: string;
  group: string;
  npi: string;
  taxId: string;
}

export type StateType = (typeof AllStates extends readonly (infer TElementType)[] ? TElementType : never)['value'];

export interface VirtualLocationBody {
  name: string;
  code?: string;
}

export const AllStatesToVirtualLocationsData: {
  [value in StateType]: VirtualLocationBody;
} = {
  AL: { name: 'Telemed Alabama' },
  AK: {
    name: 'Telemed Alaska',
    code: 'AKTELE',
  },
  AZ: { name: 'Telemed Arizona' },
  AR: { name: 'Telemed Arkansas' },
  CA: {
    name: 'Telemed California',
    code: 'CATELE',
  },
  CO: { name: 'Telemed Colorado' },
  CT: {
    name: 'Telemed Connecticut',
    code: 'CTTELE',
  },
  DE: {
    name: 'Telemed Delaware',
    code: 'DETELE',
  },
  DC: { name: 'Telemed District of Columbia' },
  FL: {
    name: 'Telemed Florida',
    code: 'FLTELE',
  },
  GA: { name: 'Telemed Georgia' },
  HI: { name: 'Telemed Hawaii' },
  ID: { name: 'Telemed Idaho' },
  IL: {
    name: 'Telemed Illinois',
    code: 'ILTELE',
  },
  IN: { name: 'Telemed Indiana' },
  IA: { name: 'Telemed Iowa' },
  KS: { name: 'Telemed Kansas' },
  KY: { name: 'Telemed Kentucky' },
  LA: { name: 'Telemed Louisiana' },
  ME: { name: 'Telemed Maine' },
  MD: {
    name: 'Telemed Maryland',
    code: 'MDTELE',
  },
  MA: {
    name: 'Telemed Massachusetts',
    code: 'MATELE',
  },
  MI: { name: 'Telemed Michigan' },
  MN: { name: 'Telemed Minnesota' },
  MS: { name: 'Telemed Mississippi' },
  MO: { name: 'Telemed Missouri' },
  MT: { name: 'Telemed Montana' },
  NE: { name: 'Telemed Nebraska' },
  NV: { name: 'Telemed Nevada' },
  NH: { name: 'Telemed New Hampshire' },
  NJ: {
    name: 'Telemed New Jersey',
    code: 'NJTELE',
  },
  NM: { name: 'Telemed New Mexico' },
  NY: {
    name: 'Telemed New York',
    code: 'NYTELE',
  },
  NC: {
    name: 'Telemed North Carolina',
    code: 'NCTELE',
  },
  ND: { name: 'Telemed North Dakota' },
  OH: { name: 'Telemed Ohio' },
  OK: { name: 'Telemed Oklahoma' },
  OR: { name: 'Telemed Oregon' },
  PA: {
    name: 'Telemed Pennsylvania',
    code: 'PATELE',
  },
  RI: { name: 'Telemed Rhode Island' },
  SC: { name: 'Telemed South Carolina' },
  SD: { name: 'Telemed South Dakota' },
  TN: {
    name: 'Telemed Tennessee',
    code: 'TNTELE',
  },
  TX: {
    name: 'Telemed Texas',
    code: 'TXTELE',
  },
  UT: { name: 'Telemed Utah' },
  VT: { name: 'Telemed Vermont' },
  VI: { name: 'Telemed Virgin Islands' },
  VA: {
    name: 'Telemed Virginia',
    code: 'VATELE',
  },
  WA: { name: 'Telemed Washington' },
  WV: { name: 'Telemed West Virginia' },
  WI: { name: 'Telemed Wisconsin' },
  WY: { name: 'Telemed Wyoming' },
};

export enum FhirAppointmentType {
  walkin = 'walkin',
  posttelemed = 'posttelemed',
  prebook = 'prebook',
  virtual = 'virtual',
}

// internal communication coding
const INTERNAL_COMMUNICATION_SYSTEM = 'intra-communication';
const ISSUE_REPORT_CODE = 'intake-issue-report';

export const COMMUNICATION_ISSUE_REPORT_CODE = {
  system: INTERNAL_COMMUNICATION_SYSTEM,
  code: ISSUE_REPORT_CODE,
};

export interface FacilityInfo {
  name: string;
  address: string;
  phone: string;
}

export const FacilitiesTelemed: FacilityInfo[] = [
  { name: 'Telemed Alabama', address: 'Bayside, NY', phone: '' },
  { name: 'Telemed Alaska', address: 'Anchorage, AK', phone: '907-222-5090' },
  { name: 'Telemed Arizona', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Arkansas', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed California', address: 'LOS ANGELES, CA', phone: '310-312-5437' },
  { name: 'Telemed Colorado', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Connecticut', address: 'WEST HARTFORD, CT', phone: '860-232-5437' },
  { name: 'Telemed District of Columbia', address: 'GREENBELT, MD', phone: '' },
  { name: 'Telemed Delaware', address: 'NEWARK, DE', phone: '302-500-5437' },
  { name: 'Telemed Florida', address: 'CORAL SPRINGS, FL', phone: '954-951-0008' },
  { name: 'Telemed Georgia', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Hawaii', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Idaho', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Illinois', address: 'Naperville, IL', phone: '630-470-4878' },
  { name: 'Telemed Indiana', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Iowa', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Maryland', address: 'GREENBELT, MD', phone: '301-982-5437' },
  { name: 'Telemed Massachusetts', address: 'DEDHAM, MA', phone: '781-461-6767' },
  { name: 'Telemed Michigan', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Minnesota', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Missouri', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed New Hampshire', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed New Jersey', address: 'LIVINGSTON, NJ', phone: '973-992-4767' },
  { name: 'Telemed New York', address: 'BAYSIDE, NY', phone: '718-747-5437' },
  { name: 'Telemed North Carolina', address: 'MORRISVILLE, NC', phone: '919-467-7425' },
  { name: 'Telemed Ohio', address: 'BAYSIDE, NY', phone: '' },
  { name: 'Telemed Pennsylvania', address: 'WAYNE, PA', phone: '267-730-6767' },
  { name: 'Telemed Tennessee', address: 'MURFREESBORO, TN', phone: '' },
  { name: 'Telemed Texas', address: 'THE COLONY, TX', phone: '214-488-5437' },
  { name: 'Telemed Virginia', address: 'SPRINGFIELD, VA', phone: '703-644-5437' },
];

export interface InHouseMedicationInfo {
  name: string;
  NDC: string;
  CPT: string;
  adminCode: string;
}
export interface PatientBaseInfo {
  firstName?: string;
  id?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
}
export interface FileUpload {
  [key: string]: {
    fileData: File | null;
    uploadFailed: boolean;
  };
}

export interface FileURLs {
  [key: string]: {
    localUrl?: string;
    presignedUrl?: string;
    z3Url?: string;
    imgBase64?: string;
  };
}
export interface AvailableLocationInformation {
  id: string | undefined;
  slug: string | undefined;
  name: string | undefined;
  description: string | undefined;
  address: Address | undefined;
  telecom: ContactPoint[] | undefined;
  hoursOfOperation: LocationHoursOfOperation[] | undefined;
  closures: Closure[];
  timezone: string | undefined;
  otherOffices: { display: string; url: string }[];
}

// Closure start/end format: 'M/d/yyyy'
export interface Closure {
  start: string;
  end: string;
  type: ClosureType;
}
export enum ClosureType {
  OneDay = 'one-day',
  Period = 'period',
}

export const OVERRIDE_DATE_FORMAT = 'M/d/yyyy';
export const HOURS_OF_OPERATION_FORMAT = 'TT';

export const getSlugAndStateFromLocation = (
  location: AvailableLocationInformation | undefined
): { slug: string | undefined; state: string | undefined } => {
  if (location == undefined) {
    return { slug: undefined, state: undefined };
  }
  const { slug } = location;
  const state = location.address?.state?.toLowerCase();

  return { slug, state };
};

export type FormItemType =
  | 'Text'
  | 'Select'
  | 'Radio'
  | 'Radio List'
  | 'Free Select'
  | 'Date'
  | 'Year'
  | 'File'
  | 'Photos'
  | 'Checkbox'
  | 'Header 3'
  | 'Header 4'
  | 'HTML'
  | 'Description'
  | 'Button'
  | 'Date Year'
  | 'Date Month'
  | 'Date Day'
  | 'Group'
  | 'Form list'
  | 'Photos'
  | 'Payment Method'
  | 'Membership Details'
  | 'Radio With Details'
  | undefined;

export type PromiseReturnType<T> = T extends Promise<infer R> ? R : never;

export interface ConsentInfo {
  HIPAA: boolean;
  consentToTreat: boolean;
  signature: string;
  fullName: string;
  relationship: string;
}
export interface ConsentSigner {
  signature: string;
  fullName: string;
  relationship: string;
}

export type UserType = 'Patient' | 'Parent/Guardian';

export interface ContactInfo {
  formUser?: UserType;
  patientNumber?: string;
  parentNumber?: string;
  patientEmail?: string;
  parentEmail?: string;
  streetAddressLine1?: string;
  streetAddressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface HealthcareContacts {
  ethnicity?: PatientEthnicity;
  race?: PatientRace;
  physicianFirstName?: string;
  physicianLastName?: string;
  physicianPhoneNumber?: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
}

export enum PatientEthnicity {
  'Hispanic or Latino' = 'Hispanic or Latino',
  'Not Hispanic or Latino' = 'Not Hispanic or Latino',
  'Decline to Specify' = 'Decline to Specify',
}

export enum PatientRace {
  'American Indian or Alaska Native' = 'American Indian or Alaska Native',
  'Asian' = 'Asian',
  'Black or African American' = 'Black or African American',
  'Native Hawaiian or Other Pacific Islander' = 'Native Hawaiian or Other Pacific Islander',
  'White' = 'White',
  'Decline to Specify' = 'Decline to Specify',
}

export interface ResponsiblePartyInfo {
  relationship: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  dateOfBirth: string;
  birthSex?: PersonSex;
  phoneNumber?: string;
}

export interface PhotoIdCards {
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  idCardFrontLocalUrl?: string;
  idCardBackLocalUrl?: string;
  idCardFrontPresignedUrl?: string;
  idCardBackPresignedUrl?: string;
}

export enum PersonSex {
  Male = 'male',
  Female = 'female',
  Intersex = 'other',
  Unknown = 'unknown',
}

export interface ZambdaInput {
  headers: any | null;
  body: string | null;
  secrets: Secrets | null;
  requestContext: any;
}

export type ZambdaTriggerType = 'http_open' | 'http_auth' | 'subscription' | 'cron';

export interface ValuePair {
  value: string;
  label: string;
}

export const months = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

export const AllStates: ValuePair[] = [
  { value: 'AL', label: 'AL' }, // Alabama
  { value: 'AK', label: 'AK' }, // Alaska
  { value: 'AZ', label: 'AZ' }, // Arizona
  { value: 'AR', label: 'AR' }, // Arkansas
  { value: 'CA', label: 'CA' }, // California
  { value: 'CO', label: 'CO' }, // Colorado
  { value: 'CT', label: 'CT' }, // Connecticut
  { value: 'DE', label: 'DE' }, // Delaware
  { value: 'DC', label: 'DC' },
  { value: 'FL', label: 'FL' }, // Florida
  { value: 'GA', label: 'GA' }, // Georgia
  { value: 'HI', label: 'HI' }, // Hawaii
  { value: 'ID', label: 'ID' }, // Idaho
  { value: 'IL', label: 'IL' }, // Illinois
  { value: 'IN', label: 'IN' }, // Indiana
  { value: 'IA', label: 'IA' }, // Iowa
  { value: 'KS', label: 'KS' }, // Kansas
  { value: 'KY', label: 'KY' }, // Kentucky
  { value: 'LA', label: 'LA' }, // Louisiana
  { value: 'ME', label: 'ME' }, // Maine
  { value: 'MD', label: 'MD' }, // Maryland
  { value: 'MA', label: 'MA' }, // Massachusetts
  { value: 'MI', label: 'MI' }, // Michigan
  { value: 'MN', label: 'MN' }, // Minnesota
  { value: 'MS', label: 'MS' }, // Mississippi
  { value: 'MO', label: 'MO' }, // Missouri
  { value: 'MT', label: 'MT' }, // Montana
  { value: 'NE', label: 'NE' }, // Nebraska
  { value: 'NV', label: 'NV' }, // Nevada
  { value: 'NH', label: 'NH' }, // New Hampshire
  { value: 'NJ', label: 'NJ' }, // New Jersey
  { value: 'NM', label: 'NM' }, // New Mexico
  { value: 'NY', label: 'NY' }, // New York
  { value: 'NC', label: 'NC' }, // North Carolina
  { value: 'ND', label: 'ND' }, // North Dakota
  { value: 'OH', label: 'OH' }, // Ohio
  { value: 'OK', label: 'OK' }, // Oklahoma
  { value: 'OR', label: 'OR' }, // Oregon
  { value: 'PA', label: 'PA' }, // Pennsylvania
  { value: 'RI', label: 'RI' }, // Rhode Island
  { value: 'SC', label: 'SC' }, // South Carolina
  { value: 'SD', label: 'SD' }, // South Dakota
  { value: 'TN', label: 'TN' }, // Tennessee
  { value: 'TX', label: 'TX' }, // Texas
  { value: 'UT', label: 'UT' }, // Utah
  { value: 'VT', label: 'VT' }, // Vermont
  { value: 'VA', label: 'VA' }, // Virginia
  { value: 'VI', label: 'VI' },
  { value: 'WA', label: 'WA' }, // Washington
  { value: 'WV', label: 'WV' }, // West Virginia
  { value: 'WI', label: 'WI' }, // Wisconsin
  { value: 'WY', label: 'WY' }, // Wyoming
];

export interface DateComponents {
  day: string;
  month: string;
  year: string;
}
