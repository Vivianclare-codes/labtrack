import { samples } from "@/app/lib/sample-data";

export type ReviewStatus = "Pending Review" | "Approved" | "Rejected";

export interface ReviewRecord {
  id: string;
  sampleNumber: string;
  patientName: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  priority: string;
  result: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  notes: string;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
}

export const initialReviewRecords: ReviewRecord[] = samples
  .slice(0, 8)
  .map((sample, index) => ({
    id: sample.id,
    sampleNumber: sample.sampleNumber,
    patientName: sample.patientName,
    hospitalNumber: sample.hospitalNumber,
    test: sample.test,
    department: sample.department,
    receivedAt: sample.receivedAt,
    priority: sample.priority,
    result: "Demo result entered",
    unit: "Not specified",
    referenceRange: "Not specified",
    interpretation: "Pending clinical review",
    notes: "Illustrative result record for the LabTrack demo.",
    submittedBy: "Amara Okafor",
    submittedAt: sample.receivedAt,
    status: "Pending Review",
  }));