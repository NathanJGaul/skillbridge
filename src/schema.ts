export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string;
}

export interface Contact {
  name: string;
  email: string;
}

export interface Position {
  partnerProgramAgency: string;
  service: string;
  durationOfTraining: string;
  cost: string;
  closestInstallation: string;
  opportunityLocationsByState: string;
  deliveryMethod: string;
  targetMOCs: string;
  otherEligibilityFactors: string;
  otherPrerequisite: string;
  jobsDescription: string;
  summaryDescription: string;
  jobFamily: string;
  mouOrganization: string;
  location?: Location;
  contact?: Contact;
}
