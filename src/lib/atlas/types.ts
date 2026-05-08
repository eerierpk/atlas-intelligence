export type Modality = "MRI" | "CT";
export type Vendor = "Siemens Healthineers" | "GE HealthCare" | "Philips" | "Canon Medical";
export type ClinicalTag = "oncology" | "neuro" | "trauma" | "cardiac" | "pediatrics" | "musculoskeletal" | "abdominal" | "emergency";
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
  fieldStrengthT?: number; // MRI
  boreCm?: number; // MRI
  sliceCount?: number; // CT
  detectorRows?: number; // CT
  rotationTimeS?: number; // CT
  gradientStrength?: number; // mT/m
  // operational
  throughputPerDay: number;
  uptimePct: number;
  setupWeeks: number;
  complexity: Complexity;
  maintenanceBurden: 1 | 2 | 3 | 4 | 5;
  powerKW: number;
  // financial
  budgetTier: BudgetTier;
  estCostUSDm: number; // millions
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
  confidence: number; // 0-100
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

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[]; // device ids
  rationale?: string[];
  confidence?: number;
  createdAt: number;
}
