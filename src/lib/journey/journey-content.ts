import type { Modality } from "@/lib/atlas/types";
import { journeyAssetUrls } from "@/lib/journey/journey-asset-urls";

export interface JourneyActor {
  role: string;
  summary: string;
}

export interface FlowPhase {
  title: string;
  summary: string;
  steps: string[];
}

export interface SampleFigure {
  src: string;
  alt: string;
  caption: string;
  credit: string;
}

export interface JourneyResource {
  label: string;
  org: string;
  url: string;
}

export interface JourneyContent {
  modality: Modality;
  modalityIntro: string;
  actors: JourneyActor[];
  setupFlow: FlowPhase[];
  userFlow: FlowPhase[];
  /** Modality-specific bullets appended under setup / use sections */
  setupNotes: string[];
  useNotes: string[];
  integrationSnapshot: { title: string; body: string }[];
  dicomTagExamples: { tag: string; name: string; value: string }[];
  sampleFigures: SampleFigure[];
  resources: JourneyResource[];
}

const ACTORS: JourneyActor[] = [
  { role: "Clinical / departmental lead", summary: "Defines case mix, priorities, and go-live readiness from a patient-care perspective." },
  { role: "Lead technologist / chief radiographer", summary: "Owns protocols, staffing on the console, and day-to-day QC discipline." },
  { role: "Medical physicist", summary: "Acceptance testing, dose/MR safety oversight, and regulatory-facing performance baselines." },
  { role: "Biomedical / clinical engineering", summary: "Service contract relationship, uptime, and vendor escalation path." },
  { role: "IT & cybersecurity", summary: "Network segmentation, identity, remote access, DICOM/MWL integration, backups." },
  { role: "Facilities & construction", summary: "Power, HVAC, shielding, rigging path, floor load, and life-safety coordination." },
  { role: "Procurement & finance", summary: "Contract, payment milestones, training entitlements, and warranty terms." },
  { role: "Vendor PM & applications", summary: "Install schedule, engineering days, and hands-on training delivery." },
];

const SETUP_FLOW: FlowPhase[] = [
  {
    title: "1. Procurement & governance",
    summary: "Align stakeholders before site work starts.",
    steps: [
      "Contract covers hardware, software, warranty, uptime remedies, and applications-training days.",
      "Radiation-safety or MR-safety governance engaged early (ionizing vs MR differs).",
      "IT security review for vendor remote access and PHI boundaries.",
    ],
  },
  {
    title: "2. Site & room readiness",
    summary: "Everything the OEM site guide will ask for.",
    steps: [
      "Floor load, ceiling height, door swing, and rigging path verified against the largest shipping segment.",
      "Power: phases, kVA, isolated power or UPS expectations per OEM.",
      "HVAC: temperature/humidity bands; redundancy for heat-producing systems.",
      "Patient flow: changing, prep, control-room sightlines, accessibility.",
    ],
  },
  {
    title: "3. Modality-specific environment",
    summary: "Shielding, magnetic field, or acoustic constraints — see modality notes below.",
    steps: [
      "Ionizing rooms: shielding designed to workload and occupancy (physicist-led).",
      "MRI: RF enclosure, 5-gauss containment, quench vent, cryogen access (OEM-driven).",
      "Ultrasound: ergonomics, probe reprocessing footprint, minimal structural demands.",
    ],
  },
  {
    title: "4. Delivery, install, integration",
    summary: "Mechanical completion meets network reality.",
    steps: [
      "Mechanical install and sign-off with facilities and vendor.",
      "Modality VLAN, static addressing or DHCP reservations, NTP for study timestamps.",
      "DICOM destinations, AE titles, and Modality Worklist (MWL) to reduce manual entry.",
      "Read the DICOM Conformance Statement against your PACS/RIS architecture.",
    ],
  },
  {
    title: "5. Acceptance & go-live",
    summary: "Baselines before first patient.",
    steps: [
      "Acceptance testing with medical physics vs purchase contract — save baselines.",
      "Applications training in two waves: safety/basics at go-live, optimization after real cases.",
      "Go-live checklist: MWL live, PACS receive verified, escalation numbers posted.",
    ],
  },
];

const USER_FLOW: FlowPhase[] = [
  {
    title: "1. Order & schedule",
    summary: "The exam exists in the EHR/RIS before the patient arrives.",
    steps: [
      "Order with indication and protocol; accession number ties order ↔ images ↔ report.",
      "MWL exposes the slot on the modality — fewer typos than manual demographic entry.",
    ],
  },
  {
    title: "2. Arrival, identification, consent",
    summary: "Non-negotiable safety layer.",
    steps: [
      "Two patient identifiers verified at the modality (institutional policy).",
      "Consent / contrast screening / pregnancy screening per modality and protocol.",
    ],
  },
  {
    title: "3. Modality screening & prep",
    summary: "MRI vs ionizing vs ultrasound differ sharply.",
    steps: [
      "MRI: ferromagnetic and device screening; zone discipline.",
      "Ionizing: pregnancy and prior exposure considerations; contrast prep if applicable.",
      "US: minimal screening; skin prep and probe selection by exam.",
    ],
  },
  {
    title: "4. Positioning & acquisition",
    summary: "Protocol-led, not improvised.",
    steps: [
      "Position and landmark per protocol; coach breath-holds or stillness as needed.",
      "Run scout/localizer then diagnostic series; monitor patient throughout.",
    ],
  },
  {
    title: "5. Console QA & patient release",
    summary: "Catch omissions before the patient leaves.",
    steps: [
      "Technologist checks coverage, motion, and contrast phases before release.",
      "Urgent findings follow institutional critical-results policy.",
    ],
  },
  {
    title: "6. Archive & reporting",
    summary: "Pixels become part of the record.",
    steps: [
      "Images pushed to PACS/VNA; headers carry UIDs linking series and study.",
      "Radiologist worklist; signed report returns to EHR via HL7 ORU or FHIR DiagnosticReport.",
    ],
  },
];

const INTEGRATION_SNAPSHOT = [
  { title: "DICOM", body: "Images and rich metadata move as objects (CT, MR, US, etc.) with unique Study/Series/SOP Instance UIDs." },
  { title: "PACS / VNA", body: "Long-term storage and viewer access; VNA decouples storage from the front-end vendor." },
  { title: "RIS / EHR", body: "Orders, scheduling, and billing context; feeds MWL and receives finalized reports." },
  { title: "HL7 & FHIR", body: "v2 ORM/ORU still common; FHIR ImagingStudy and DiagnosticReport are modern integration surfaces." },
  { title: "DICOMweb", body: "HTTPS retrieval and search (WADO-RS, QIDO-RS, STOW-RS) for web-native apps." },
];

const DICOM_TAGS = [
  { tag: "(0010,0010)", name: "PatientName", value: "SYNTH^ATLAS" },
  { tag: "(0010,0020)", name: "PatientID", value: "EDU-0001" },
  { tag: "(0008,0050)", name: "AccessionNumber", value: "ACC-1029384" },
  { tag: "(0020,000D)", name: "StudyInstanceUID", value: "1.2.840.10008…" },
  { tag: "(0008,103E)", name: "SeriesDescription", value: "Example series" },
  { tag: "(0018,0060)", name: "KVP", value: "120 (CT example)" },
];

const RESOURCES: JourneyResource[] = [
  { label: "DICOM standard (current)", org: "DICOM", url: "https://www.dicomstandard.org/current" },
  { label: "DICOMweb overview", org: "DICOM", url: "https://www.dicomstandard.org/dicomweb" },
  { label: "FHIR ImagingStudy", org: "HL7", url: "https://www.hl7.org/fhir/imagingstudy.html" },
  { label: "IHE Radiology TF", org: "IHE", url: "https://www.ihe.net/resources/technical_frameworks/#radiology" },
];

const MODALITY_INTRO: Record<Modality, string> = {
  MRI: "MRI uses a strong static magnetic field and RF pulses. Planning centers on MR safety, RF shielding, fringe-field containment, and cryogen/quench infrastructure.",
  CT: "CT acquires cross-sectional X-ray data with a rotating tube and detector array. Shielding, dose stewardship, and contrast workflows dominate planning and use.",
  "X-ray": "Digital radiography is typically a single exposure on a flat-panel detector. Technique, positioning, and scatter control drive image quality.",
  Ultrasound: "Ultrasound is real-time, non-ionizing, and operator-dependent. Site needs are lighter; probe hygiene and ergonomics matter most.",
  Mammography: "Dedicated breast imaging with compression and strict QC. Tomosynthesis adds a pseudo-3D stack on top of 2D acquisition.",
  "PET/CT": "Hybrid functional (PET) and anatomic (CT) imaging. Tracer logistics, uptake time, and motion management define the workflow.",
};

const SETUP_NOTES: Record<Modality, string[]> = {
  MRI: [
    "RF-shielded magnet room (Faraday cage); external RF kept out.",
    "5-gauss line contained per safety plan; MR safety zones I–IV enforced.",
    "Quench pipe to exterior; cryogen delivery and service access routes.",
    "Coil storage near the suite; ferromagnetic policies for tools and equipment.",
  ],
  CT: [
    "Shielding calculation from physicist based on workload and adjacent occupancy.",
    "Three-phase power, chilled water or heat rejection per gantry requirements.",
    "Contrast injector location, spill kit, and emergency pathways.",
  ],
  "X-ray": [
    "Room shielding per tube location, workload, and scatter geometry.",
    "Wall, door, and viewport interlocks where required.",
    "Grid and technique factors matched to anatomy and detector size.",
  ],
  Ultrasound: [
    "Room size, lighting, and ergonomics for prolonged scanning.",
    "Dedicated probe disinfection for endocavitary work — manufacturer-approved chemistry.",
  ],
  Mammography: [
    "Dedicated breast imaging suite; compression paddle QA tracked.",
    "Phantom-based daily QC tied to accreditation expectations.",
  ],
  "PET/CT": [
    "Hot lab / radiopharmacy interface; dose calibrated to scan time.",
    "Uptake room environment (quiet, warm) to standardize FDG biodistribution.",
    "CT portion used for attenuation correction — alignment and breathing protocols matter.",
  ],
};

const USE_NOTES: Record<Modality, string[]> = {
  MRI: [
    "MR safety screening for every patient: implants, foreign bodies, devices.",
    "Coil and sequence chosen per approved protocol; SAR and noise managed by the system within limits.",
    "Acoustic noise and claustrophobia managed with hearing protection and communication.",
  ],
  CT: [
    "Size-appropriate protocols and iterative reconstruction where available.",
    "Bolus timing for vascular phases; mistimed contrast often means repeat imaging.",
  ],
  "X-ray": [
    "Positioning first: most repeats are alignment issues, not exposure alone.",
    "AEC chamber selection must match the anatomy being imaged.",
  ],
  Ultrasound: [
    "Probe frequency trades resolution vs depth; label every clip for the reader.",
    "Doppler angle and scale set for the clinical question.",
  ],
  Mammography: [
    "Explain compression; patient cooperation directly affects dose and quality.",
    "Screening vs diagnostic pathways differ; recalls are workflow, not diagnosis.",
  ],
  "PET/CT": [
    "Fasting and glucose checks for FDG; muscle uptake minimized during uptake period.",
    "Breathing mismatch between PET and CT produces recognizable artifacts — follow breath-hold or gating rules.",
  ],
};

/** Educational sample images — external URLs are Wikimedia Commons; verify license before production redistribution. */
const FIG_BASE: SampleFigure[] = [
  {
    src: journeyAssetUrls.dicomObjectSchematic,
    alt: "Diagram splitting DICOM metadata header from pixel grid",
    caption: "Conceptually, each DICOM instance stores metadata (tags) and pixel data (single frame or multi-frame).",
    credit: "MedIntel Atlas — educational schematic",
  },
  {
    src: journeyAssetUrls.diagramEcosystem,
    alt: "Orders and images flowing between modality, RIS, and PACS",
    caption: "Typical data path: order in RIS/EHR → worklist on modality → images to PACS → report back to EHR.",
    credit: "MedIntel Atlas — educational diagram",
  },
];

const FIG_BY_MODALITY: Record<Modality, SampleFigure[]> = {
  MRI: [
    {
      src: journeyAssetUrls.diagramMriZones,
      alt: "MR safety zones diagram",
      caption: "MR safety zoning and fringe-field control are core to suite design.",
      credit: "MedIntel Atlas — educational diagram",
    },
    {
      src: journeyAssetUrls.sampleMriSchematic,
      alt: "Schematic sagittal head with greyscale bands suggesting MR contrast",
      caption: "MR emphasizes soft-tissue differences; real scans depend on sequence (T1, T2, FLAIR, etc.) and field strength.",
      credit: "MedIntel Atlas — educational schematic (not a clinical image)",
    },
  ],
  CT: [
    {
      src: journeyAssetUrls.diagramCtDose,
      alt: "CTDIvol and DLP conceptual diagram",
      caption: "CT outputs dose metrics for quality programs; values here are educational only.",
      credit: "MedIntel Atlas — educational diagram",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/CT_of_the_heart_with_contrast.jpg/640px-CT_of_the_heart_with_contrast.jpg",
      alt: "Axial CT image of the heart with intravenous contrast",
      caption: "Example CT slice: high spatial resolution of anatomy; windowing changes lung vs soft-tissue display.",
      credit: "Wikimedia Commons — public domain (NIH)",
    },
  ],
  "X-ray": [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg/800px-Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg",
      alt: "Normal posteroanterior chest radiograph",
      caption: "Example projection radiograph: positioning and inspiration level strongly affect diagnostic quality.",
      credit: "Wikimedia Commons — CC BY-SA 3.0",
    },
  ],
  Ultrasound: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ultrasound_of_human_heart%2C_apical_4_chamber_view.jpg/640px-Ultrasound_of_human_heart%2C_apical_4_chamber_view.jpg",
      alt: "Apical four-chamber echocardiography still frame",
      caption: "Example ultrasound: real-time tomographic planes; speckle and gain settings affect interpretation.",
      credit: "Wikimedia Commons — CC BY-SA 3.0",
    },
  ],
  Mammography: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mammogram.jpg/640px-Mammogram.jpg",
      alt: "Mammogram example",
      caption: "Example mammographic acquisition; clinical units use vendor-specific processing and QC targets.",
      credit: "Wikimedia Commons — public domain",
    },
  ],
  "PET/CT": [
    {
      src: journeyAssetUrls.diagramPetctFusion,
      alt: "PET overlaid on CT for fusion",
      caption: "PET adds functional uptake; CT adds anatomy and attenuation correction.",
      credit: "MedIntel Atlas — educational diagram",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/PET-CT_of_lung_cancer.jpg/640px-PET-CT_of_lung_cancer.jpg",
      alt: "Fused PET/CT showing hypermetabolic lesion",
      caption: "Example fused display: hot spots on PET aligned to CT anatomy (educational case image).",
      credit: "Wikimedia Commons — CC BY-SA 3.0",
    },
  ],
};

export function journeyContentFor(modality: Modality): JourneyContent {
  return {
    modality,
    modalityIntro: MODALITY_INTRO[modality],
    actors: ACTORS,
    setupFlow: SETUP_FLOW,
    userFlow: USER_FLOW,
    setupNotes: SETUP_NOTES[modality],
    useNotes: USE_NOTES[modality],
    integrationSnapshot: INTEGRATION_SNAPSHOT,
    dicomTagExamples: DICOM_TAGS,
    sampleFigures: [...FIG_BASE, ...FIG_BY_MODALITY[modality]],
    resources: RESOURCES,
  };
}
