export type PatientType = string;

export interface Patient {
  id: number;
  patientId: string;
  hospitalNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sexAtBirth: string;
  phoneNumber: string | null;
  patientType: PatientType;
  clinicOrWard: string;
  registrationDate: string;
}
