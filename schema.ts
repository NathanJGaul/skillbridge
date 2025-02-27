export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string;
  title: string;
  contactName: string;
  contactEmail: string;
}

export interface Position {
  partnerProgramAgency: string;
  service: string;
  city: string;
  state: string;
  durationOfTraining: string;
  employerPOC: string;
  pocEmail: string;
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
}