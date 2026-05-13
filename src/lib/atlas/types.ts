export type Modality = "MRI" | "CT" | "X-ray" | "Ultrasound" | "Mammography" | "PET/CT";
export type Vendor =
  | "Siemens Healthineers"
  | "GE HealthCare"
  | "Philips"
  | "Canon Medical"
  | "Hologic"
  | "Fujifilm";
export type ClinicalTag =
  | "oncology"
  | "neuro"
  | "trauma"
  | "cardiac"
  | "pediatrics"
  | "musculoskeletal"
  | "abdominal"
  | "emergency"
  | "breast"
  | "obstetrics"
  | "vascular"
  | "molecular";
export type BudgetTier = "Entry" | "Mid" | "Premium" | "Flagship";
export type Complexity = "Low" | "Moderate" | "High";

export interface Device {
  id: string;
  name: string;
  vendor: Vendor;
  modality: Modality;
  releaseYear: number;
  tagline: string;
  // technical
  fieldStrengthT?: number;
  boreCm?: number;
  sliceCount?: number;
  detectorRows?: number;
  rotationTimeS?: number;
  gradientStrength?: number;
  // operational
  throughputPerDay: number;
  uptimePct: number;
  setupWeeks: number;
  complexity: Complexity;
  maintenanceBurden: 1 | 2 | 3 | 4 | 5;
  powerKW: number;
  // financial
  budgetTier: BudgetTier;
  estCostUSDm: number;
  roiYears: number;
  costPerScanUSD: number;
  // ai
  aiCapabilities: string[];
  aiMaturity: 1 | 2 | 3 | 4 | 5;
  // compatibility
  standards: string[];
  // clinical
  clinicalTags: ClinicalTag[];
  // confidence
  confidence: number;
  sources: string[];
}

export interface SavedComparison {
  id: string;
  deviceIds: string[];
  createdAt: number;
  title: string;
}

export interface AISession {
  id: string;
  title: string;
  createdAt: number;
  messages: AIMessage[];
}

/** Snapshot fields saved from Intel Expert agent (separate from AI chat sessions). */
export interface IntelExpertDraftSnapshot {
  tagline: string;
  clinicalPositioning: string;
  aiWorkflowNotes: string;
  standardsIntegration: string;
  dataSourceNotes: string;
  procurementNotes: string;
}

export interface IntelExpertWorkspaceEntry {
  id: string;
  deviceId: string;
  title: string;
  vendor: Vendor;
  modality: Modality;
  createdAt: number;
  draft: IntelExpertDraftSnapshot;
}

/** Structured procurement-style review shown in the AI panel (e.g. from a device detail page). */
export interface DeviceReviewSnapshot {
  deviceId: string;
  summary: string;
  strengths: string[];
  tradeoffs: string[];
  sources: string[];
  confidence: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[];
  rationale?: string[];
  confidence?: number;
  /** When set, the assistant bubble renders this as staged “live” review cards. */
  deviceReview?: DeviceReviewSnapshot;
  createdAt: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "needs-review";
  lastRun: string;
  confidence: number;
  dataSources: string[];
  tasks: { id: string; title: string; state: "queued" | "running" | "done"; ts: string }[];
  logs: { ts: string; level: "info" | "warn" | "ok"; msg: string }[];
}
