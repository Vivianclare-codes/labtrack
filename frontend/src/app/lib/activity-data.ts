export type ActivityCategory =
  | "Patient"
  | "Sample"
  | "Test"
  | "Result"
  | "Staff"
  | "System";

export type ActivityRecord = {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  category: ActivityCategory;
  timestamp: string;
  time: string;
  details: string;
};

export const activities: ActivityRecord[] = [
  {
    id: "ACT-001",
    actor: "James Carter",
    role: "Admin",
    action: "Updated staff permissions",
    target: "Amara Okafor",
    category: "Staff",
    timestamp: "14 Mar 2026",
    time: "10:42 AM",
    details: "Updated department access and staff permissions.",
  },
  {
    id: "ACT-002",
    actor: "Emma Reed",
    role: "Receptionist",
    action: "Registered a new patient",
    target: "PT-260314-001",
    category: "Patient",
    timestamp: "14 Mar 2026",
    time: "10:25 AM",
    details: "Added a new patient record to the patient registry.",
  },
  {
    id: "ACT-003",
    actor: "Amara Okafor",
    role: "Scientist",
    action: "Started sample processing",
    target: "LB-260314-0042",
    category: "Sample",
    timestamp: "14 Mar 2026",
    time: "10:12 AM",
    details: "Sample processing started in Haematology.",
  },
  {
    id: "ACT-004",
    actor: "Dr Sarah Lewis",
    role: "Supervisor",
    action: "Approved test results",
    target: "LB-260314-0038",
    category: "Result",
    timestamp: "14 Mar 2026",
    time: "09:58 AM",
    details: "Reviewed and approved submitted test results.",
  },
  {
    id: "ACT-005",
    actor: "Emma Reed",
    role: "Receptionist",
    action: "Registered a new sample",
    target: "LB-260314-0042",
    category: "Sample",
    timestamp: "14 Mar 2026",
    time: "09:45 AM",
    details: "Registered a blood sample and created its test request.",
  },
  {
    id: "ACT-006",
    actor: "Amara Okafor",
    role: "Scientist",
    action: "Submitted test results",
    target: "LB-260314-0038",
    category: "Test",
    timestamp: "14 Mar 2026",
    time: "09:32 AM",
    details: "Submitted test results for supervisor review.",
  },
  {
    id: "ACT-007",
    actor: "Emma Reed",
    role: "Receptionist",
    action: "Updated patient information",
    target: "PT-260314-002",
    category: "Patient",
    timestamp: "14 Mar 2026",
    time: "09:18 AM",
    details: "Updated the patient's contact information.",
  },
  {
    id: "ACT-008",
    actor: "James Carter",
    role: "Admin",
    action: "Added a staff account",
    target: "Staff account",
    category: "Staff",
    timestamp: "14 Mar 2026",
    time: "08:56 AM",
    details: "Created a new laboratory staff account.",
  },
  {
    id: "ACT-009",
    actor: "Amara Okafor",
    role: "Scientist",
    action: "Received a sample",
    target: "LB-260314-0035",
    category: "Sample",
    timestamp: "13 Mar 2026",
    time: "04:42 PM",
    details: "Confirmed receipt of a sample in Microbiology.",
  },
  {
    id: "ACT-010",
    actor: "Dr Sarah Lewis",
    role: "Supervisor",
    action: "Rejected submitted results",
    target: "LB-260314-0031",
    category: "Result",
    timestamp: "13 Mar 2026",
    time: "03:30 PM",
    details: "Returned submitted results for correction.",
  },
  {
    id: "ACT-011",
    actor: "James Carter",
    role: "Admin",
    action: "Updated department settings",
    target: "Microbiology",
    category: "System",
    timestamp: "13 Mar 2026",
    time: "02:15 PM",
    details: "Updated department configuration.",
  },
  {
    id: "ACT-012",
    actor: "Emma Reed",
    role: "Receptionist",
    action: "Registered a new patient",
    target: "PT-260313-008",
    category: "Patient",
    timestamp: "13 Mar 2026",
    time: "11:06 AM",
    details: "Added a new patient record to the patient registry.",
  },
];

export const activityCategories: ActivityCategory[] = [
  "Patient",
  "Sample",
  "Test",
  "Result",
  "Staff",
  "System",
];