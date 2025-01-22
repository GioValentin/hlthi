declare namespace JSX {
  interface IntrinsicElements {
    'photon-client': {
      id: string;
      org: string;
      'dev-mode': string;
      'auto-login': string;
      'redirect-uri': string;
      children: Element;
      connection?: string;
    };
    'photon-prescribe-workflow': {
      'enable-order': string;
      'patient-id'?: string;
      weight?: number;
      'weight-unit'?: 'lbs' | 'kg';
    };
  }
}
