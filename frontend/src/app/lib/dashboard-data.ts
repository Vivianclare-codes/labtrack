export type SampleStatus =
  | "Received"
  | "Processing"
  | "Completed"
  | "Pending"
  | "Urgent";

export interface Sample {
  id: string;
  patient: string;
  hospitalNumber: string;
  test: string;
  department: string;
  receivedAt: string;
  status: SampleStatus;
  priority: "Routine" | "Urgent";
}

export const dashboardStats = [
  {
    label: "Total samples",
    value: "128",
    change: "+12",
    description: "from yesterday",
    type: "neutral",
  },
  {
    label: "Pending",
    value: "24",
    change: "8 urgent",
    description: "awaiting processing",
    type: "warning",
  },
  {
    label: "Processing",
    value: "36",
    change: "Across 5",
    description: "laboratory departments",
    type: "info",
  },
  {
    label: "Completed",
    value: "68",
    change: "53%",
    description: "of today's samples",
    type: "success",
  },
] as const;

export const recentSamples: Sample[] = [
  {
    id: "LB-261105-0001",
    patient: "Amaka Okafor",
    hospitalNumber: "PT-000241",
    test: "Full Blood Count",
    department: "Haematology",
    receivedAt: "09:42 AM",
    status: "Completed",
    priority: "Routine",
  },
  {
    id: "LB-261105-0002",
    patient: "David Williams",
    hospitalNumber: "PT-000242",
    test: "Malaria Parasite",
    department: "Microbiology",
    receivedAt: "09:35 AM",
    status: "Processing",
    priority: "Urgent",
  },
  {
    id: "LB-261105-0003",
    patient: "Grace Eze",
    hospitalNumber: "PT-000243",
    test: "Liver Function Test",
    department: "Chemical Pathology",
    receivedAt: "09:21 AM",
    status: "Pending",
    priority: "Routine",
  },
  {
    id: "LB-261105-0004",
    patient: "Samuel Johnson",
    hospitalNumber: "PT-000244",
    test: "Blood Culture",
    department: "Microbiology",
    receivedAt: "09:10 AM",
    status: "Processing",
    priority: "Urgent",
  },
  {
    id: "LB-261105-0005",
    patient: "Chiamaka Nwosu",
    hospitalNumber: "PT-000245",
    test: "Blood Group",
    department: "Haematology",
    receivedAt: "08:56 AM",
    status: "Completed",
    priority: "Routine",
  },
  {
    id: "LB-261105-0006",
    patient: "Peter James",
    hospitalNumber: "PT-000246",
    test: "Thyroid Function Test",
    department: "Chemical Pathology",
    receivedAt: "08:40 AM",
    status: "Received",
    priority: "Routine",
  },
];

export const departmentWorkload = [
  {
    name: "Haematology",
    total: 34,
    completed: 22,
    color: "#24776D",
  },
  {
    name: "Microbiology",
    total: 28,
    completed: 14,
    color: "#4B708E",
  },
  {
    name: "Chemical Pathology",
    total: 26,
    completed: 18,
    color: "#BB8980",
  },
  {
    name: "Histopathology",
    total: 18,
    completed: 9,
    color: "#D5B47C",
  },
  {
    name: "Serology/Immunology",
    total: 22,
    completed: 5,
    color: "#99B8B0",
  },
];

export const prioritySamples = [
  {
    id: "LB-261105-0002",
    patient: "David Williams",
    test: "Malaria Parasite",
    department: "Microbiology",
    wait: "42 min",
  },
  {
    id: "LB-261105-0004",
    patient: "Samuel Johnson",
    test: "Blood Culture",
    department: "Microbiology",
    wait: "35 min",
  },
  {
    id: "LB-261105-0007",
    patient: "Esther Brown",
    test: "Full Blood Count",
    department: "Haematology",
    wait: "28 min",
  },
];