import { DispositionType } from '../types';

const pcpLabel = 'Primary Care Physician';

export const mapDispositionTypeToLabel: Record<DispositionType, string> = {
  ip: 'HTLHi IP Transfer',
  'ip-lab': 'HTLHi IP Lab',
  pcp: pcpLabel,
  ed: 'ED Transfer',
  'ip-oth': 'Non-HTLHi IP Transfer',
  'pcp-no-type': pcpLabel,
  another: 'Transfer to Another Location',
  specialty: 'Specialty Transfer',
};

export const dispositionCheckboxOptions = [
  {
    label: 'Dentistry',
    name: 'dentistry',
  },
  {
    label: 'ENT',
    name: 'ent',
  },
  {
    label: 'Ophthalmology',
    name: 'ophthalmology',
  },
  {
    label: 'Orthopedics',
    name: 'orthopedics',
  },
  {
    label: 'Other',
    name: 'other',
  },
  // {
  //   label: 'Lurie CT',
  //   name: 'lurie-ct',
  // },
] as const;
