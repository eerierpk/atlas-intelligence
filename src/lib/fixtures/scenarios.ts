// Teaching scenarios per modality — illustrative only, not patient-specific.
import type { Modality } from "@/lib/atlas/types";

export interface ScenarioMetric {
  metric: string;
  measures: string;
  typicalRange: string;
  exampleValue: string;
  deviation: string;
}

export interface ScenarioStep {
  label: string;
  body: string;
}

export interface AnnotatedHotspot {
  // % coordinates on the figure
  xPct: number;
  yPct: number;
  label: string;
  note: string;
}

export interface AnnotatedFigure {
  src: string;
  alt: string;
  caption: string;
  hotspots: AnnotatedHotspot[];
}

export interface Scenario {
  id: string;
  name: string;
  shortDescription: string;
  patientJourney: ScenarioStep[];
  acquisition: { name: string; description: string; figures: { src: string; caption: string }[] };
  imageGuide: AnnotatedFigure;
  metrics: ScenarioMetric[];
  nextSteps: string[];
  videoPoster?: string;
  videoCaptions: string[];
}

const STD_NEXT = [
  "Correlation with clinical history and prior imaging.",
  "Discussion at multidisciplinary team meeting where indicated.",
  "Additional imaging (e.g., contrast-enhanced or alternative modality) per institutional protocol.",
  "Referral pathways follow institutional guidelines — urgency tiers (routine / soon / emergent) vary by site.",
];

const MRI_BRAIN: Scenario = {
  id: "mri-brain-routine",
  name: "Routine brain MRI (non-contrast)",
  shortDescription: "Standard multi-sequence brain protocol — teaching example for routine neurological assessment.",
  patientJourney: [
    { label: "Arrival & screening", body: "Patient checks in; MR safety screening verifies no contraindicated implants, devices, or metallic foreign bodies. ID and exam correlate with the order." },
    { label: "Consent & education", body: "Technologist explains acoustic noise, breath-hold expectations (if any), and the importance of remaining still. Hearing protection is fitted." },
    { label: "Positioning", body: "Supine, head-first, head in a dedicated head/neck coil with foam padding. Eyes closed; head immobilized with cushions to minimize motion." },
    { label: "Room conditions", body: "Lights dimmed; intercom verified; patient handed an emergency squeeze-ball. Zone IV access controlled." },
    { label: "Acquisition", body: "Localizers followed by routine sequences (e.g., T1, T2, FLAIR, DWI). Illustrative duration: 15–25 minutes." },
    { label: "Egress & handoff", body: "Patient assisted off the table; images sent to PACS; report queued for the radiologist." },
  ],
  acquisition: {
    name: "T1 / T2 / FLAIR / DWI multi-sequence brain",
    description: "Combination of structural and diffusion-weighted sequences gives complementary tissue contrast for general neurological assessment.",
    figures: [
      { src: "/journey/sample-mri-schematic.svg", caption: "Schematic — MRI scanner geometry (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-mri-zones.svg",
    alt: "MR safety zones diagram",
    caption: "Educational overlay — MR safety zones (I–IV). Hover hotspots for context.",
    hotspots: [
      { xPct: 18, yPct: 50, label: "Zone I", note: "Public access — no MR-specific restrictions." },
      { xPct: 38, yPct: 50, label: "Zone II", note: "Reception / screening area; supervised access." },
      { xPct: 58, yPct: 50, label: "Zone III", note: "Restricted — only screened personnel and patients." },
      { xPct: 80, yPct: 50, label: "Zone IV", note: "Magnet room — strict screening and supervision required." },
    ],
  },
  metrics: [
    { metric: "Field strength", measures: "Magnet operating field", typicalRange: "1.5T or 3T (clinical)", exampleValue: "3T", deviation: "Field strength affects SNR, susceptibility, and SAR — discuss with physicist." },
    { metric: "SAR", measures: "Specific Absorption Rate (RF energy)", typicalRange: "< 4 W/kg whole-body (normal mode)", exampleValue: "1.8 W/kg (illustrative)", deviation: "Exceeding limits triggers system-side throttling — refer to vendor IFU." },
    { metric: "Acoustic noise", measures: "Peak sound pressure", typicalRange: "Up to ~110 dB(A) gradient peaks", exampleValue: "98 dB(A) (illustrative)", deviation: "Hearing protection mandatory; refer to local OH&S policy." },
    { metric: "SNR", measures: "Signal-to-Noise Ratio", typicalRange: "Sequence- and coil-dependent", exampleValue: "—", deviation: "Low SNR can indicate coil mispositioning or shim issues — re-shim or re-position." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Localizer scout completed.",
    "Auto-shim in progress…",
    "T1 sagittal acquisition…",
    "FLAIR axial acquisition…",
    "Diffusion-weighted imaging…",
    "Series transferred to PACS.",
  ],
};

const CT_CHEST: Scenario = {
  id: "ct-chest-routine",
  name: "Routine chest CT (non-contrast)",
  shortDescription: "Standard chest CT for parenchymal evaluation — teaching example.",
  patientJourney: [
    { label: "Arrival & verification", body: "Patient identified; pregnancy status confirmed where applicable; consent reviewed for ionizing radiation exposure." },
    { label: "Positioning", body: "Supine, head-first, arms above the head to remove arm artifact from the field of view. Arms supported in a dedicated arm rest." },
    { label: "Breathing instructions", body: "Breath-hold coaching — typically end-inspiration. Practice run before acquisition." },
    { label: "Room conditions", body: "Standard lighting; technologist remains in control room with intercom and visual contact." },
    { label: "Acquisition", body: "Topogram, then helical acquisition through the thorax. Illustrative scan time: under a minute; total room time 5–10 minutes." },
    { label: "Egress", body: "Patient released; images reconstructed in lung and mediastinal windows; sent to PACS." },
  ],
  acquisition: {
    name: "Helical chest acquisition (lung & mediastinal windows)",
    description: "Single helical pass during breath-hold; multiple reconstruction kernels generate lung-window and mediastinal-window series.",
    figures: [
      { src: "/journey/diagram-ct-dose.svg", caption: "Schematic — CT dose concepts (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-ct-dose.svg",
    alt: "CT dose concepts",
    caption: "Educational overlay — dose-related labels. Hover hotspots for context.",
    hotspots: [
      { xPct: 25, yPct: 40, label: "CTDIvol", note: "Volume CT Dose Index — scanner-reported dose surrogate per slice/volume." },
      { xPct: 55, yPct: 60, label: "DLP", note: "Dose-Length Product — CTDIvol × scan length." },
      { xPct: 78, yPct: 35, label: "ALARA", note: "As Low As Reasonably Achievable — guiding dose-management principle." },
    ],
  },
  metrics: [
    { metric: "CTDIvol", measures: "Volume CT Dose Index", typicalRange: "Protocol- and patient-size dependent", exampleValue: "5.8 mGy (illustrative)", deviation: "Outside expected range → review tube current modulation and patient size." },
    { metric: "DLP", measures: "Dose-Length Product", typicalRange: "Protocol- and length-dependent", exampleValue: "210 mGy·cm (illustrative)", deviation: "Higher than expected → check scan range and protocol selection." },
    { metric: "Slice thickness", measures: "Reconstructed slice", typicalRange: "0.5–5 mm", exampleValue: "1.0 mm (illustrative)", deviation: "Thicker slices reduce noise but lower spatial resolution." },
    { metric: "Tube voltage", measures: "kVp", typicalRange: "80–140 kVp", exampleValue: "120 kVp (illustrative)", deviation: "Lower kVp increases iodine contrast but may increase noise." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Topogram acquired.",
    "Patient table positioned.",
    "Breath-hold instruction issued…",
    "Helical acquisition in progress…",
    "Reconstructing lung window…",
    "Reconstructing mediastinal window…",
    "Series transferred to PACS.",
  ],
};

const XR_CHEST: Scenario = {
  id: "xr-chest-pa",
  name: "Chest X-ray (PA / lateral)",
  shortDescription: "Standard erect chest radiograph — teaching example.",
  patientJourney: [
    { label: "Arrival & ID", body: "Patient identified; pregnancy status confirmed; jewelry and metallic objects removed from the field." },
    { label: "Positioning (PA)", body: "Patient stands facing the detector, chin raised, hands on hips with shoulders rolled forward to clear scapulae." },
    { label: "Lateral", body: "Patient stands sideways, arms raised; left lateral is conventional unless clinically indicated otherwise." },
    { label: "Exposure", body: "End-inspiration breath-hold; technologist exposes from the control booth using protective shielding." },
    { label: "Image review", body: "Quality check (penetration, rotation, inspiration); repeat if substandard." },
  ],
  acquisition: {
    name: "PA + lateral projections",
    description: "Standard two-view chest radiograph for general thoracic survey.",
    figures: [
      { src: "/journey/diagram-ecosystem.svg", caption: "Schematic — imaging ecosystem (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-ecosystem.svg",
    alt: "Imaging ecosystem",
    caption: "Educational overlay — imaging ecosystem touchpoints relevant to X-ray workflows.",
    hotspots: [
      { xPct: 20, yPct: 50, label: "Modality", note: "X-ray system acquires the projection image." },
      { xPct: 50, yPct: 50, label: "Workstation", note: "Technologist QC on acquisition workstation." },
      { xPct: 80, yPct: 50, label: "PACS / VNA", note: "Images stored in PACS / VNA for review." },
    ],
  },
  metrics: [
    { metric: "kVp", measures: "Tube voltage", typicalRange: "100–125 kVp (chest)", exampleValue: "115 kVp (illustrative)", deviation: "Lower kVp increases contrast but may underpenetrate large patients." },
    { metric: "mAs", measures: "Tube current × time", typicalRange: "1–4 mAs (chest)", exampleValue: "2.5 mAs (illustrative)", deviation: "Outside range → check AEC, patient size, distance." },
    { metric: "DAP", measures: "Dose-Area Product", typicalRange: "Protocol-dependent", exampleValue: "0.18 Gy·cm² (illustrative)", deviation: "Trend across cohort to detect drift." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Patient positioned PA…",
    "Inspiration breath-hold…",
    "Exposure complete.",
    "Lateral repositioning…",
    "Image transferred to PACS.",
  ],
};

const US_ABDO: Scenario = {
  id: "us-abdomen",
  name: "Abdominal ultrasound (general)",
  shortDescription: "General abdominal ultrasound survey — teaching example.",
  patientJourney: [
    { label: "Preparation", body: "Patient typically fasted per protocol to reduce bowel gas; bladder filling per indication." },
    { label: "Positioning", body: "Supine on the exam table; gel applied to the abdomen; sonographer adjusts patient position (left lateral decubitus, etc.) as needed." },
    { label: "Acquisition", body: "Sonographer sweeps the curvilinear probe across hepatobiliary, renal, pancreatic, and vascular structures, capturing still images and cine clips." },
    { label: "Egress", body: "Gel removed; patient released; study sent to PACS for radiologist review." },
  ],
  acquisition: {
    name: "Curvilinear probe abdominal survey",
    description: "Real-time greyscale and Doppler imaging of abdominal organs.",
    figures: [
      { src: "/journey/diagram-ecosystem.svg", caption: "Schematic — imaging ecosystem (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-ecosystem.svg",
    alt: "US ecosystem context",
    caption: "Educational overlay — operator-dependent acquisition with workstation review.",
    hotspots: [
      { xPct: 20, yPct: 50, label: "Probe", note: "Curvilinear (3–5 MHz) for deep abdominal imaging." },
      { xPct: 50, yPct: 50, label: "TGC", note: "Time-Gain Compensation balances near/far echoes." },
      { xPct: 80, yPct: 50, label: "PACS", note: "Stills + cine clips archived for review." },
    ],
  },
  metrics: [
    { metric: "Probe frequency", measures: "Acoustic frequency", typicalRange: "2–7 MHz (abdominal)", exampleValue: "3.5 MHz (illustrative)", deviation: "Higher MHz = better resolution, less depth." },
    { metric: "Depth setting", measures: "Imaging depth", typicalRange: "10–20 cm", exampleValue: "16 cm (illustrative)", deviation: "Adjust to target organ; over-depth wastes pixels." },
    { metric: "MI / TI", measures: "Mechanical / Thermal Index", typicalRange: "ALARA-bound", exampleValue: "MI 0.9 (illustrative)", deviation: "Keep as low as feasible per ALARA." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Probe positioned RUQ…",
    "Hepatobiliary survey…",
    "Renal survey…",
    "Cine clips captured.",
    "Study transferred to PACS.",
  ],
};

const MAMMO: Scenario = {
  id: "mg-screening",
  name: "Screening mammography (bilateral)",
  shortDescription: "Bilateral screening mammogram (CC + MLO) — teaching example.",
  patientJourney: [
    { label: "Arrival & history", body: "Patient history reviewed (prior imaging, surgeries, hormonal therapy). Pregnancy status confirmed." },
    { label: "Positioning (CC)", body: "Patient standing; breast positioned on the platform with consistent compression; technologist coaches breath-hold." },
    { label: "Positioning (MLO)", body: "Tube angled 45–60°; breast and pectoral muscle included for adequate posterior coverage." },
    { label: "Acquisition", body: "Compression applied per protocol; brief exposure; repeat per side." },
    { label: "Quality check", body: "Technologist confirms positioning, compression adequacy, and image quality before releasing the patient." },
  ],
  acquisition: {
    name: "CC + MLO bilateral views (± tomosynthesis)",
    description: "Standard 2D screening with optional digital breast tomosynthesis.",
    figures: [
      { src: "/journey/diagram-ecosystem.svg", caption: "Schematic — imaging ecosystem (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-ecosystem.svg",
    alt: "Mammography QC context",
    caption: "Educational overlay — QC and integration touchpoints.",
    hotspots: [
      { xPct: 25, yPct: 50, label: "Compression", note: "Adequate compression reduces dose and motion blur." },
      { xPct: 55, yPct: 50, label: "AEC", note: "Automatic Exposure Control adapts to breast composition." },
      { xPct: 80, yPct: 50, label: "QC", note: "Daily / weekly QC per regulatory program." },
    ],
  },
  metrics: [
    { metric: "Compression force", measures: "Applied compression", typicalRange: "Patient-tolerated; clinically adequate", exampleValue: "—", deviation: "Insufficient compression → motion / overlap; excessive → patient discomfort." },
    { metric: "Average glandular dose", measures: "AGD per view", typicalRange: "Protocol-dependent", exampleValue: "1.6 mGy (illustrative)", deviation: "Outside range → review AEC and target/filter combination." },
    { metric: "QC pass rate", measures: "Daily QC", typicalRange: "100% expected", exampleValue: "100% (illustrative)", deviation: "Any fail blocks clinical use until resolved." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Right CC positioning…",
    "Compression applied…",
    "Exposure complete.",
    "Right MLO positioning…",
    "Left side acquisition…",
    "Study transferred to PACS.",
  ],
};

const PETCT: Scenario = {
  id: "petct-oncology",
  name: "PET/CT oncology staging (FDG)",
  shortDescription: "Whole-body FDG PET/CT — teaching example for oncology context.",
  patientJourney: [
    { label: "Pre-arrival prep", body: "Fasting, glucose check, and hydration per protocol; warm room to minimize brown-fat uptake." },
    { label: "Tracer administration", body: "FDG injected per weight-based protocol; uptake period (typically ~60 min) in a quiet, low-stimulation room." },
    { label: "Voiding", body: "Patient voids immediately before scan to reduce bladder activity in pelvic regions." },
    { label: "Positioning", body: "Supine, arms typically up (oncology) to reduce attenuation artifact through the torso." },
    { label: "Acquisition", body: "Low-dose CT for attenuation correction + anatomical localization, followed by PET acquisition (multiple bed positions)." },
    { label: "Egress", body: "Patient briefed on radiation precautions; images reconstructed and fused for review." },
  ],
  acquisition: {
    name: "Low-dose CT + PET (whole body)",
    description: "CT supplies attenuation map and anatomical context; PET supplies metabolic activity map. Fusion enables co-registered review.",
    figures: [
      { src: "/journey/diagram-petct-fusion.svg", caption: "Schematic — PET/CT fusion (educational)." },
    ],
  },
  imageGuide: {
    src: "/journey/diagram-petct-fusion.svg",
    alt: "PET/CT fusion concept",
    caption: "Educational overlay — fusion concept. Hover hotspots for context.",
    hotspots: [
      { xPct: 22, yPct: 50, label: "CT", note: "Low-dose CT for attenuation correction & anatomy." },
      { xPct: 52, yPct: 50, label: "PET", note: "Metabolic activity map via FDG uptake." },
      { xPct: 80, yPct: 50, label: "Fusion", note: "Co-registered display for radiologist review." },
    ],
  },
  metrics: [
    { metric: "Injected activity", measures: "Tracer dose", typicalRange: "Weight-based per protocol", exampleValue: "—", deviation: "Outside protocol → review prep / weight calculation." },
    { metric: "Blood glucose", measures: "Pre-scan glucose", typicalRange: "Institutional thresholds vary", exampleValue: "—", deviation: "Elevated glucose competes with FDG uptake — discuss with reading physician." },
    { metric: "Uptake time", measures: "Time from injection to scan", typicalRange: "~60 min (FDG)", exampleValue: "60 min (illustrative)", deviation: "Significant deviation affects SUV interpretation." },
    { metric: "SUV (max)", measures: "Standardized Uptake Value", typicalRange: "Lesion- and protocol-dependent", exampleValue: "—", deviation: "Always interpret with clinical context — SUV alone is not diagnostic." },
  ],
  nextSteps: STD_NEXT,
  videoCaptions: [
    "Glucose verified.",
    "FDG injected; uptake timer started…",
    "Uptake period complete.",
    "Patient positioned; topogram acquired.",
    "Low-dose CT acquisition…",
    "PET bed positions acquiring…",
    "Reconstruction & fusion in progress…",
    "Series transferred to PACS.",
  ],
};

const BY_MODALITY: Record<Modality, Scenario[]> = {
  MRI: [MRI_BRAIN],
  CT: [CT_CHEST],
  "X-ray": [XR_CHEST],
  Ultrasound: [US_ABDO],
  Mammography: [MAMMO],
  "PET/CT": [PETCT],
};

export function getScenariosForModality(m: Modality): Scenario[] {
  return BY_MODALITY[m] ?? [];
}
