export type ReportPeriod = "7 days" | "30 days" | "90 days";

export interface ReportMetric {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  description: string;
}

export interface DepartmentReport {
  name: string;
  samples: number;
  percentage: number;
}

export interface StatusReport {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TrendReport {
  label: string;
  samples: number;
}

export const reportPeriods: ReportPeriod[] = ["7 days", "30 days", "90 days"];

export const reportData: Record<
  ReportPeriod,
  {
    metrics: ReportMetric[];
    departments: DepartmentReport[];
    statuses: StatusReport[];
    trend: TrendReport[];
  }
> = {
  "7 days": {
    metrics: [
      {
        label: "Total samples",
        value: "128",
        change: "+12.5%",
        direction: "up",
        description: "Compared with previous 7 days",
      },
      {
        label: "Completed tests",
        value: "86",
        change: "+8.2%",
        direction: "up",
        description: "Compared with previous 7 days",
      },
      {
        label: "Pending samples",
        value: "24",
        change: "-4.1%",
        direction: "down",
        description: "Compared with previous 7 days",
      },
      {
        label: "Urgent samples",
        value: "18",
        change: "+2.0%",
        direction: "up",
        description: "Compared with previous 7 days",
      },
    ],
    departments: [
      { name: "Haematology", samples: 42, percentage: 100 },
      { name: "Microbiology", samples: 31, percentage: 74 },
      { name: "Chemical Pathology", samples: 25, percentage: 60 },
      { name: "Histopathology", samples: 18, percentage: 43 },
      { name: "Serology/Immunology", samples: 12, percentage: 29 },
    ],
    statuses: [
      { name: "Completed", count: 68, percentage: 53, color: "#24776D" },
      { name: "Processing", count: 36, percentage: 28, color: "#4B708E" },
      { name: "Pending", count: 16, percentage: 13, color: "#D5B47C" },
      { name: "Received", count: 8, percentage: 6, color: "#A2ADB1" },
    ],
    trend: [
      { label: "Mon", samples: 14 },
      { label: "Tue", samples: 19 },
      { label: "Wed", samples: 16 },
      { label: "Thu", samples: 23 },
      { label: "Fri", samples: 20 },
      { label: "Sat", samples: 18 },
      { label: "Sun", samples: 18 },
    ],
  },

  "30 days": {
    metrics: [
      {
        label: "Total samples",
        value: "486",
        change: "+10.4%",
        direction: "up",
        description: "Compared with previous 30 days",
      },
      {
        label: "Completed tests",
        value: "352",
        change: "+7.8%",
        direction: "up",
        description: "Compared with previous 30 days",
      },
      {
        label: "Pending samples",
        value: "42",
        change: "-3.2%",
        direction: "down",
        description: "Compared with previous 30 days",
      },
      {
        label: "Urgent samples",
        value: "64",
        change: "+1.5%",
        direction: "up",
        description: "Compared with previous 30 days",
      },
    ],
    departments: [
      { name: "Haematology", samples: 156, percentage: 100 },
      { name: "Microbiology", samples: 124, percentage: 79 },
      { name: "Chemical Pathology", samples: 98, percentage: 63 },
      { name: "Histopathology", samples: 66, percentage: 42 },
      { name: "Serology/Immunology", samples: 42, percentage: 27 },
    ],
    statuses: [
      { name: "Completed", count: 352, percentage: 72, color: "#24776D" },
      { name: "Processing", count: 82, percentage: 17, color: "#4B708E" },
      { name: "Pending", count: 34, percentage: 7, color: "#D5B47C" },
      { name: "Received", count: 18, percentage: 4, color: "#A2ADB1" },
    ],
    trend: [
      { label: "Week 1", samples: 102 },
      { label: "Week 2", samples: 118 },
      { label: "Week 3", samples: 126 },
      { label: "Week 4", samples: 140 },
    ],
  },

  "90 days": {
    metrics: [
      {
        label: "Total samples",
        value: "1,382",
        change: "+14.2%",
        direction: "up",
        description: "Compared with previous 90 days",
      },
      {
        label: "Completed tests",
        value: "1,046",
        change: "+11.6%",
        direction: "up",
        description: "Compared with previous 90 days",
      },
      {
        label: "Pending samples",
        value: "86",
        change: "-5.4%",
        direction: "down",
        description: "Compared with previous 90 days",
      },
      {
        label: "Urgent samples",
        value: "172",
        change: "+3.1%",
        direction: "up",
        description: "Compared with previous 90 days",
      },
    ],
    departments: [
      { name: "Haematology", samples: 428, percentage: 100 },
      { name: "Microbiology", samples: 356, percentage: 83 },
      { name: "Chemical Pathology", samples: 282, percentage: 66 },
      { name: "Histopathology", samples: 188, percentage: 44 },
      { name: "Serology/Immunology", samples: 128, percentage: 30 },
    ],
    statuses: [
      { name: "Completed", count: 1046, percentage: 76, color: "#24776D" },
      { name: "Processing", count: 214, percentage: 15, color: "#4B708E" },
      { name: "Pending", count: 86, percentage: 6, color: "#D5B47C" },
      { name: "Received", count: 36, percentage: 3, color: "#A2ADB1" },
    ],
    trend: [
      { label: "Month 1", samples: 412 },
      { label: "Month 2", samples: 456 },
      { label: "Month 3", samples: 514 },
    ],
  },
};