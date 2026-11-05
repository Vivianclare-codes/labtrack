export type SampleStatus =
  | "Received"
  | "Processing"
  | "Completed"
  | "Pending";

export type SamplePriority = "Routine" | "Urgent";

export interface SampleRecord {
  id: string;
  sampleNumber: string;
  patientName: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  receivedTime: string;
  status: SampleStatus;
  priority: SamplePriority;
}

export const samples: SampleRecord[] = [
  {
    id: "1",
    sampleNumber: "LB-261105-0001",
    patientName: "Grace Okafor",
    hospitalNumber: "PT-000241",
    test: "Full Blood Count",
    department: "Haematology",
    receivedAt: "05 Nov 2026",
    receivedTime: "09:15 AM",
    status: "Processing",
    priority: "Urgent",
  },
  {
    id: "2",
    sampleNumber: "LB-261105-0002",
    patientName: "David Williams",
    hospitalNumber: "PT-000240",
    test: "Malaria Parasite",
    department: "Microbiology",
    receivedAt: "05 Nov 2026",
    receivedTime: "09:30 AM",
    status: "Received",
    priority: "Routine",
  },
  {
    id: "3",
    sampleNumber: "LB-261105-0003",
    patientName: "Amara Nwosu",
    hospitalNumber: "PT-000239",
    test: "Liver Function Test",
    department: "Chemical Pathology",
    receivedAt: "05 Nov 2026",
    receivedTime: "09:45 AM",
    status: "Completed",
    priority: "Routine",
  },
  {
    id: "4",
    sampleNumber: "LB-261105-0004",
    patientName: "Michael Brown",
    hospitalNumber: "PT-000238",
    test: "Blood Culture",
    department: "Microbiology",
    receivedAt: "05 Nov 2026",
    receivedTime: "10:00 AM",
    status: "Pending",
    priority: "Urgent",
  },
  {
    id: "5",
    sampleNumber: "LB-261105-0005",
    patientName: "Chiamaka Eze",
    hospitalNumber: "PT-000237",
    test: "Blood Group",
    department: "Haematology",
    receivedAt: "05 Nov 2026",
    receivedTime: "10:15 AM",
    status: "Processing",
    priority: "Routine",
  },
  {
    id: "6",
    sampleNumber: "LB-261104-0008",
    patientName: "Samuel Johnson",
    hospitalNumber: "PT-000236",
    test: "Kidney Function Test",
    department: "Chemical Pathology",
    receivedAt: "04 Nov 2026",
    receivedTime: "03:20 PM",
    status: "Completed",
    priority: "Routine",
  },
  {
    id: "7",
    sampleNumber: "LB-261104-0007",
    patientName: "Ngozi Adams",
    hospitalNumber: "PT-000235",
    test: "Urinalysis",
    department: "Chemical Pathology",
    receivedAt: "04 Nov 2026",
    receivedTime: "02:45 PM",
    status: "Received",
    priority: "Routine",
  },
  {
    id: "8",
    sampleNumber: "LB-261104-0006",
    patientName: "Peter Clarke",
    hospitalNumber: "PT-000234",
    test: "Histology",
    department: "Histopathology",
    receivedAt: "04 Nov 2026",
    receivedTime: "01:30 PM",
    status: "Processing",
    priority: "Urgent",
  },
  {
    id: "9",
    sampleNumber: "LB-261104-0005",
    patientName: "Blessing Obi",
    hospitalNumber: "PT-000233",
    test: "HIV Screening",
    department: "Serology/Immunology",
    receivedAt: "04 Nov 2026",
    receivedTime: "12:10 PM",
    status: "Completed",
    priority: "Routine",
  },
  {
    id: "10",
    sampleNumber: "LB-261104-0004",
    patientName: "Daniel Smith",
    hospitalNumber: "PT-000232",
    test: "Full Blood Count",
    department: "Haematology",
    receivedAt: "04 Nov 2026",
    receivedTime: "11:50 AM",
    status: "Pending",
    priority: "Urgent",
  },
  {
    id: "11",
    sampleNumber: "LB-261103-0003",
    patientName: "Ada Okoro",
    hospitalNumber: "PT-000231",
    test: "Malaria Parasite",
    department: "Microbiology",
    receivedAt: "03 Nov 2026",
    receivedTime: "04:20 PM",
    status: "Received",
    priority: "Routine",
  },
  {
    id: "12",
    sampleNumber: "LB-261103-0002",
    patientName: "Emeka Ibe",
    hospitalNumber: "PT-000230",
    test: "Electrolytes",
    department: "Chemical Pathology",
    receivedAt: "03 Nov 2026",
    receivedTime: "02:00 PM",
    status: "Completed",
    priority: "Routine",
  },
];