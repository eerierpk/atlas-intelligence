import type { Modality } from "@/lib/atlas/types";
import type { Chapter, Curriculum, ElementTile, GlossaryTerm, Resource } from "./types";

/* ----------------------------- shared spine ----------------------------- */

const SETUP_SPINE: Chapter[] = [
  {
    id: "procurement",
    title: "Procurement & stakeholders",
    summary: "Who is around the table before a single cable is pulled.",
    lessons: [
      {
        id: "procurement-roles",
        title: "Mapping the cast: who owns what",
        minutes: 4,
        body: [
          { kind: "p", text: "An imaging install is a multi-discipline project. Naming each owner up-front prevents weeks of finger-pointing later." },
          { kind: "list", items: [
            "Clinical lead (radiologist or department chief): defines the case mix and protocols.",
            "Lead technologist / chief radiographer: owns daily operations and protocol library.",
            "Medical physicist: signs off acceptance, dose, MR safety where applicable.",
            "Biomedical / clinical engineering: long-term service liaison with the OEM.",
            "IT & cybersecurity: networking, identity, PHI boundary, backup.",
            "Facilities: power, HVAC, structural, shielding contractor.",
            "Procurement & finance: contract, service tier, applications training days.",
          ]},
          { kind: "callout", tone: "info", text: "Tip: every stakeholder should be invited to the kick-off, not just CCed on the contract." },
        ],
      },
      {
        id: "procurement-contract",
        title: "What a service contract actually buys",
        minutes: 5,
        body: [
          { kind: "p", text: "The service contract is where ROI lives or dies. Read past the headline price to see uptime guarantees, parts coverage, response SLAs, and software upgrade entitlements." },
          { kind: "list", items: [
            "Uptime guarantee and remedy if missed (credits vs cash).",
            "Parts: coil/tube/detector inclusion, glassware allowance.",
            "Engineer response time on-site and remote.",
            "Applications training days post-go-live (often the most under-used asset).",
            "Software upgrade path: included, discounted, or chargeable?",
          ]},
        ],
      },
    ],
    checkpoint: [
      {
        q: "Which roles MUST be in the kick-off meeting?",
        type: "multi",
        options: ["Medical physicist", "Marketing", "IT/security", "Facilities", "Catering"],
        correct: [0, 2, 3],
        rationale: "Physics, IT, and facilities each gate go-live; missing any one causes weeks of delay.",
      },
    ],
  },
  {
    id: "regulatory",
    title: "Regulatory & institutional gates",
    summary: "Permissions, committees, and policies before installation.",
    lessons: [
      {
        id: "regulatory-overview",
        title: "Local licensing & committee approvals",
        minutes: 4,
        body: [
          { kind: "p", text: "Requirements vary by country and even by state/region. Treat this lesson as a checklist of categories you must investigate locally — not as legal advice." },
          { kind: "list", items: [
            "Radiation-producing equipment registration (ionizing modalities).",
            "Radiation safety committee approval and named radiation safety officer.",
            "MR safety policy and MR Medical Director sign-off (for MRI).",
            "Institutional Review Board / Ethics if used for research.",
            "Cybersecurity & data-governance review (PHI, vendor remote access).",
          ]},
          { kind: "callout", tone: "warn", text: "This is education only. Always defer to your local regulator, hospital legal, and MR Safety Expert." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "True or false: regulatory requirements are identical worldwide.",
        type: "single",
        options: ["True", "False"],
        correct: [1],
        rationale: "Requirements vary widely by jurisdiction and institution; always verify locally.",
      },
    ],
  },
  {
    id: "site-planning",
    title: "Site planning & facilities",
    summary: "Floor, power, HVAC, shielding — the boring stuff that decides go-live.",
    lessons: [
      {
        id: "site-walkthrough",
        title: "The pre-install walkthrough",
        minutes: 5,
        body: [
          { kind: "p", text: "The OEM will provide a site planning guide tailored to the exact model. Compare it to the existing room early — anything you find in week 1 costs 1x; anything you find on delivery day costs 10x." },
          { kind: "list", items: [
            "Door swing & corridor width along the rigging path.",
            "Floor load capacity (especially for MR magnet & shield).",
            "Ceiling height for crane / scanner gantry.",
            "Power phase, grounding, isolated power if required.",
            "HVAC: tonnage, redundancy, humidity range.",
            "Patient flow: changing room, prep bay, waiting & control sightlines.",
          ]},
        ],
      },
    ],
    checkpoint: [
      {
        q: "Why walk the rigging path before delivery?",
        type: "single",
        options: [
          "To choose paint colors",
          "To verify door, corridor, and floor will accept the equipment",
          "Because vendors require it for warranty",
        ],
        correct: [1],
        rationale: "Mechanical access is the #1 source of last-mile delays.",
      },
    ],
  },
  {
    id: "delivery-install",
    title: "Delivery, installation & integration",
    summary: "From dock to first ping on the network.",
    lessons: [
      {
        id: "delivery-install-overview",
        title: "Hand-off between vendor and IT",
        minutes: 5,
        body: [
          { kind: "p", text: "Mechanical install belongs to the vendor; network integration is shared. Schedule the IT touchpoints before delivery so DICOM destinations, time sync, and worklist credentials are ready on day one." },
          { kind: "list", items: [
            "Static IP and DNS entry on the modality VLAN.",
            "NTP source for accurate study timestamps.",
            "DICOM AE Title, port, and destinations (PACS, dose registry, viewer).",
            "MWL connection to the RIS/EHR for scheduled worklists.",
            "Read the OEM DICOM Conformance Statement against your PACS.",
          ]},
          { kind: "callout", tone: "info", text: "Worklist (MWL) prevents typo-driven duplicate patient records — wire it up on day one, not month two." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "MWL primarily reduces…",
        type: "single",
        options: ["Image noise", "Manual data-entry errors", "Power consumption"],
        correct: [1],
        rationale: "MWL pulls the scheduled patient/order from the RIS so the technologist doesn't retype it.",
      },
    ],
  },
  {
    id: "acceptance-golive",
    title: "Acceptance, training & go-live",
    summary: "Phantoms first, then patients.",
    lessons: [
      {
        id: "acceptance-tests",
        title: "Acceptance vs routine QC vs physicist review",
        minutes: 4,
        body: [
          { kind: "p", text: "Three different cadences serve three different purposes. Don't confuse them." },
          { kind: "list", items: [
            "Acceptance testing: one-time, vendor-vs-contract, baselines image quality.",
            "Routine QC: daily/weekly, owned by technologists, catches drift.",
            "Periodic physicist review: annual, independent, regulator-friendly.",
          ]},
          { kind: "callout", tone: "ok", text: "Save the acceptance baselines. They're your reference point for every QC drift conversation for the next decade." },
        ],
      },
      {
        id: "applications-training",
        title: "Applications training: use it or lose it",
        minutes: 3,
        body: [
          { kind: "p", text: "Applications training days expire. Schedule them in two waves: one at go-live for safety + basics, another 60–90 days later for protocol optimization once your team has real cases under their belt." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "Acceptance testing is performed…",
        type: "single",
        options: ["Daily by the technologist", "Once, with the vendor, against contract", "Only after a fault"],
        correct: [1],
        rationale: "Acceptance testing happens once at install to validate contractual specs.",
      },
    ],
  },
];

const USE_SPINE: Chapter[] = [
  {
    id: "scheduling",
    title: "Scheduling & orders",
    summary: "Where every exam actually starts.",
    lessons: [
      {
        id: "order-flow",
        title: "From order to worklist",
        minutes: 4,
        body: [
          { kind: "p", text: "An order is created in the EHR/RIS, an accession number is generated, and the modality pulls the entry via DICOM Modality Worklist. This is the single most important data flow in imaging." },
          { kind: "image", src: "/journey/diagram-ecosystem.svg", alt: "Layered diagram: modality → workstation → network → archive", caption: "How orders, images, and reports flow across the imaging ecosystem.", credit: "MedIntel Atlas — educational diagram" },
          { kind: "list", items: [
            "EHR/RIS creates the order with an indication and protocol code.",
            "RIS exposes the order via HL7 v2 (ORM) or FHIR ServiceRequest.",
            "Modality queries MWL and presents the patient to the technologist.",
          ]},
        ],
      },
    ],
    checkpoint: [
      {
        q: "Which standard is most directly responsible for getting the patient onto the modality screen?",
        type: "single",
        options: ["HL7 v2 ORU", "DICOM MWL", "FHIR DiagnosticReport"],
        correct: [1],
        rationale: "MWL (Modality Worklist) is the DICOM service that delivers scheduled exams to the modality.",
      },
    ],
  },
  {
    id: "identification",
    title: "Patient identification & consent",
    summary: "Two identifiers, every time.",
    lessons: [
      {
        id: "id-policy",
        title: "Two-identifier verification",
        minutes: 3,
        body: [
          { kind: "p", text: "Every credentialing body in the world recommends two patient identifiers (name + date of birth, or MRN + date of birth). Hardcode this into your team's muscle memory." },
          { kind: "callout", tone: "warn", text: "Wrong-patient is a never-event. The cost of one extra second per exam is rounding-error compared to one mis-attributed study." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "How many independent patient identifiers should be verified before scanning?",
        type: "single",
        options: ["One", "Two", "Three"],
        correct: [1],
        rationale: "Two-identifier verification is the international standard.",
      },
    ],
  },
  {
    id: "screening",
    title: "Safety screening",
    summary: "Modality-specific. Always.",
    lessons: [
      {
        id: "screening-overview",
        title: "Why screening differs by modality",
        minutes: 4,
        body: [
          { kind: "p", text: "MRI screens for ferromagnetic implants and devices. Ionizing modalities screen for pregnancy and prior dose history. Ultrasound has minimal screening burden but still verifies indication and consent." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "MRI screening is primarily concerned with…",
        type: "single",
        options: ["Pregnancy radiation risk", "Ferromagnetic & active implants", "Allergic dye reactions"],
        correct: [1],
        rationale: "MRI's main risk profile centers on the magnetic field's interaction with implants and devices.",
      },
    ],
  },
  {
    id: "acquisition",
    title: "Acquisition workflow",
    summary: "Position, protocol, monitor.",
    lessons: [
      {
        id: "acquisition-flow",
        title: "Standard acquisition arc",
        minutes: 4,
        body: [
          { kind: "list", items: [
            "Verify patient + indication on the worklist entry.",
            "Position and immobilize as protocol requires.",
            "Select the protocol — never improvise unless physicist-approved.",
            "Run the scout / localizer first.",
            "Acquire the diagnostic series; monitor patient throughout.",
            "Review images at the console for completeness before patient leaves.",
          ]},
        ],
      },
    ],
    checkpoint: [
      {
        q: "When should the technologist review images for completeness?",
        type: "single",
        options: ["Never — that's the radiologist's job", "Before the patient leaves the table", "Only on rejected studies"],
        correct: [1],
        rationale: "Console review before patient release prevents costly recalls.",
      },
    ],
  },
  {
    id: "results-flow",
    title: "Post-processing, PACS & reporting",
    summary: "From pixels to a signed report.",
    lessons: [
      {
        id: "post-processing",
        title: "Send-to-PACS and the reporting handoff",
        minutes: 5,
        body: [
          { kind: "p", text: "Once acquired, images are reconstructed (and post-processed if needed), then DICOM-pushed to PACS. The radiologist's worklist refreshes; the report is dictated, signed, and returned to the EHR via HL7 ORU or FHIR DiagnosticReport." },
          { kind: "tagTable", rows: [
            { tag: "(0010,0010)", name: "PatientName", value: "ANON^ATLAS" },
            { tag: "(0010,0020)", name: "PatientID", value: "MA-2099-001" },
            { tag: "(0008,0050)", name: "AccessionNumber", value: "ACC-7781034" },
            { tag: "(0020,000D)", name: "StudyInstanceUID", value: "1.2.840.113619.2.55.3.604..." },
            { tag: "(0008,103E)", name: "SeriesDescription", value: "AX T2 FLAIR" },
            { tag: "(0018,0060)", name: "KVP (CT)", value: "120" },
          ]},
          { kind: "callout", tone: "info", text: "PatientName / PatientID are illustrative & synthetic. Never embed real PHI in screenshots." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "Which standard typically returns the signed report to the EHR?",
        type: "multi",
        options: ["HL7 v2 ORU", "DICOM MWL", "FHIR DiagnosticReport"],
        correct: [0, 2],
        rationale: "ORU (legacy) and FHIR DiagnosticReport (modern) both carry results; MWL is for outbound orders.",
      },
    ],
  },
];

const SHARED_ELEMENTS: ElementTile[] = [
  // Hardware
  { id: "patient-table", name: "Patient table / couch", layer: "Modality", category: "Hardware", blurb: "Positions and immobilizes the patient.", detail: "Modality-specific weight limits, motorized travel ranges, and accessory mounts (head holders, immobilization straps) are all governed by the OEM's accessory list — substitution voids warranty." },
  { id: "ups", name: "UPS & isolated power", layer: "Modality", category: "Hardware", blurb: "Keeps the modality alive through dips.", detail: "Most large modalities require conditioned, isolated power with a UPS sized to bring the system to a clean shutdown — not to keep scanning." },
  { id: "console-pc", name: "Acquisition console", layer: "Workstation", category: "Hardware", blurb: "The technologist's cockpit.", detail: "Tightly coupled to the modality firmware; never patch outside the OEM's validated update channel." },
  { id: "viewer-station", name: "Diagnostic viewer", layer: "Workstation", category: "Hardware", blurb: "Calibrated radiologist display.", detail: "Diagnostic monitors are calibrated to DICOM GSDF (greyscale standard display function); QA is a recurring task, not a one-off." },
  { id: "vlan", name: "Modality VLAN", layer: "Network", category: "Ecosystem", blurb: "Segmented network for medical devices.", detail: "Isolating modalities on their own VLAN limits blast radius if a clinical PC is compromised — a baseline cybersecurity hygiene practice." },
  { id: "pacs", name: "PACS archive", layer: "Archive/Cloud", category: "Software", blurb: "Where studies live for years.", detail: "PACS stores DICOM studies and serves them to viewers. Modern deployments often pair PACS with a Vendor-Neutral Archive (VNA) for long-term, vendor-agnostic storage." },
  { id: "vna", name: "Vendor-Neutral Archive (VNA)", layer: "Archive/Cloud", category: "Software", blurb: "Stores DICOM independent of viewer brand.", detail: "Decouples long-term storage from the front-end viewer — critical when migrating PACS vendors without re-importing 10 years of data." },
  { id: "ris", name: "RIS / EHR orders", layer: "Network", category: "Ecosystem", blurb: "Source of the worklist.", detail: "The Radiology Information System (or the imaging module of the EHR) creates the order, accession, and worklist entry consumed by the modality." },
  { id: "mwl", name: "DICOM Modality Worklist (MWL)", layer: "Network", category: "Ecosystem", blurb: "Pulls scheduled exams onto the modality.", detail: "MWL is a DICOM service: the modality queries the RIS for scheduled studies, eliminating manual entry of patient + accession at the scanner." },
  { id: "dicomweb", name: "DICOMweb (WADO/QIDO/STOW)", layer: "Network", category: "Ecosystem", blurb: "Modern web-API access to imaging.", detail: "WADO-RS retrieves studies, QIDO-RS searches metadata, STOW-RS stores new studies — all over HTTPS instead of legacy DICOM TCP." },
  { id: "hl7", name: "HL7 v2 (ORM/ORU)", layer: "Network", category: "Ecosystem", blurb: "Legacy messaging that still runs the world.", detail: "ORM messages carry orders; ORU messages carry observations/results. Pipe-delimited, terse, ubiquitous." },
  { id: "fhir", name: "FHIR ImagingStudy / DiagnosticReport", layer: "Network", category: "Ecosystem", blurb: "Modern JSON-based interop.", detail: "FHIR resources expose imaging metadata and reports through REST APIs — increasingly the preferred surface for new integrations." },
];

const SHARED_GLOSSARY: GlossaryTerm[] = [
  { term: "DICOM", short: "Digital Imaging & Communications in Medicine — the file format and network protocol for medical images." },
  { term: "DICOMweb", short: "RESTful HTTP version of DICOM services (WADO-RS, QIDO-RS, STOW-RS)." },
  { term: "WADO-RS", short: "Web Access to DICOM Objects, RESTful — fetches studies/series/instances over HTTPS." },
  { term: "QIDO-RS", short: "Query based on ID for DICOM Objects, RESTful — searches DICOM metadata over HTTPS." },
  { term: "STOW-RS", short: "Store Over the Web, RESTful — uploads new DICOM objects over HTTPS." },
  { term: "PACS", short: "Picture Archiving and Communication System — stores and serves diagnostic images." },
  { term: "VNA", short: "Vendor-Neutral Archive — long-term DICOM storage independent of the front-end viewer." },
  { term: "RIS", short: "Radiology Information System — handles orders, scheduling, and reporting workflow." },
  { term: "EHR", short: "Electronic Health Record — the patient-wide clinical record, often the source of orders." },
  { term: "HL7 v2", short: "Pipe-delimited messaging standard; ORM carries orders, ORU carries results." },
  { term: "FHIR", short: "Fast Healthcare Interoperability Resources — modern JSON/REST healthcare data standard." },
  { term: "ImagingStudy (FHIR)", short: "FHIR resource describing a radiology study and its series." },
  { term: "DiagnosticReport (FHIR)", short: "FHIR resource carrying a signed radiology report." },
  { term: "MWL", short: "DICOM Modality Worklist — the modality queries the RIS for scheduled exams." },
  { term: "MPPS", short: "Modality Performed Procedure Step — DICOM service reporting that an exam started/finished." },
  { term: "Accession Number", short: "Unique identifier per ordered exam, links order ↔ images ↔ report." },
  { term: "SOP Class UID", short: "Identifier for the type of DICOM object (e.g., CT image, MR image, structured report)." },
  { term: "Study Instance UID", short: "Globally unique ID for one imaging study." },
  { term: "GSPS", short: "Grayscale Softcopy Presentation State — saved viewer settings (window/level, annotations)." },
  { term: "GSDF", short: "Grayscale Standard Display Function — calibration curve for diagnostic monitors." },
  { term: "IHE SWF", short: "IHE Scheduled Workflow profile — vendor-neutral integration testing for ordering through reporting." },
  { term: "TLS", short: "Transport Layer Security — encrypts DICOM/HL7/FHIR traffic in transit." },
  { term: "PHI", short: "Protected Health Information — regulated patient identifiers and clinical data." },
  { term: "QC", short: "Quality Control — repeated tests verifying the system still meets baseline." },
  { term: "Acceptance testing", short: "One-time tests at install verifying contractual performance." },
  { term: "ALARA", short: "As Low As Reasonably Achievable — the radiation-dose minimization principle." },
  { term: "CTDIvol", short: "Volume CT Dose Index — scanner output metric for CT (educational reference, not patient dose)." },
  { term: "DLP", short: "Dose-Length Product — CTDIvol multiplied by scan length." },
  { term: "SNR", short: "Signal-to-Noise Ratio — image-quality metric, especially in MRI/US." },
  { term: "SAR", short: "Specific Absorption Rate — RF energy deposited in tissue during MRI." },
  { term: "5-gauss line", short: "Boundary inside which the MRI fringe field exceeds 5 gauss; access is restricted." },
  { term: "Quench", short: "Loss of superconductivity in an MR magnet, venting helium gas via a dedicated pipe." },
  { term: "Coil (MR)", short: "RF receiver placed near the anatomy to improve MR signal." },
  { term: "Parallel imaging", short: "MR technique using multiple coil channels to accelerate acquisition." },
  { term: "MIP", short: "Maximum Intensity Projection — collapses a 3D volume to highlight bright structures." },
  { term: "MPR", short: "Multi-Planar Reconstruction — re-slices a volume into arbitrary planes." },
  { term: "kVp / mA", short: "X-ray tube voltage and current — primary technique factors for radiography." },
  { term: "Detector (DR)", short: "Digital flat-panel detector that replaces film/CR in modern radiography." },
  { term: "Anti-scatter grid", short: "Removes scattered photons before they reach the detector to improve contrast." },
  { term: "Doppler (US)", short: "Ultrasound technique measuring flow velocity from frequency shift." },
  { term: "TGC", short: "Time-Gain Compensation — depth-dependent gain that flattens ultrasound brightness." },
  { term: "Compression (mammo)", short: "Reduces breast thickness to improve image quality and lower dose." },
  { term: "PET tracer", short: "Radiolabeled molecule injected before PET imaging (e.g., 18F-FDG)." },
  { term: "Attenuation correction", short: "Uses CT data to correct PET counts for tissue absorption." },
];

const SHARED_RESOURCES: Resource[] = [
  { label: "DICOM Standard (current)", org: "DICOM Standards Committee", url: "https://www.dicomstandard.org/current" },
  { label: "DICOMweb overview", org: "DICOM Standards Committee", url: "https://www.dicomstandard.org/dicomweb" },
  { label: "HL7 FHIR — Imaging module", org: "HL7 International", url: "https://www.hl7.org/fhir/imagingstudy.html" },
  { label: "IHE Radiology Technical Framework", org: "IHE International", url: "https://www.ihe.net/resources/technical_frameworks/#radiology" },
  { label: "ACR Practice Parameters", org: "American College of Radiology", url: "https://www.acr.org/Clinical-Resources/Practice-Parameters-and-Technical-Standards" },
  { label: "AAPM Reports", org: "American Association of Physicists in Medicine", url: "https://www.aapm.org/pubs/reports/" },
];

/* ----------------------------- modality overlays ----------------------------- */

const MODALITY_OVERVIEW: Record<Modality, string> = {
  MRI: "Magnetic Resonance Imaging uses a strong static magnetic field plus radio-frequency pulses to map proton behavior in tissue. It is non-ionizing but introduces a unique safety domain centered on the magnetic field itself.",
  CT: "Computed Tomography rotates an X-ray source and detector array around the patient, reconstructing cross-sectional images from many angular projections. Fast, broad indications, ionizing — dose stewardship is central.",
  "X-ray": "Digital Radiography (DR) uses a single X-ray exposure onto a flat-panel detector. The most ubiquitous and lowest-dose ionizing modality; technique factors and positioning carry image quality.",
  Ultrasound: "Ultrasound uses high-frequency sound waves and the time-of-flight of their echoes to image soft tissue and flow. Real-time, portable, operator-dependent, and non-ionizing.",
  Mammography: "Dedicated low-energy X-ray imaging of the breast, with controlled compression and a strong QC culture. Tomosynthesis (DBT) extends 2D mammography into a pseudo-3D stack.",
  "PET/CT": "Hybrid imaging combining a positron-emitting tracer (functional) with CT (anatomic). Workflow includes tracer ordering, uptake timing, and attenuation correction using the CT.",
};

const MODALITY_SETUP_OVERLAY: Record<Modality, Chapter> = {
  MRI: {
    id: "mri-siting",
    title: "MRI siting deep dive",
    summary: "RF shielding, fringe field, quench path, cryogen logistics.",
    lessons: [
      {
        id: "mri-rf-shielding",
        title: "RF-shielded enclosure & 5-gauss line",
        minutes: 6,
        body: [
          { kind: "p", text: "An MR scanner lives inside an RF-shielded room (a Faraday cage) to keep external radio noise out and the scanner's RF in. Around the scanner, the static magnetic field falls off rapidly — but not instantly." },
          { kind: "image", src: "/journey/diagram-mri-zones.svg", alt: "Diagram of MR safety zones I-IV with the 5-gauss boundary inside zone IV", caption: "MR safety zones I–IV; the 5-gauss boundary defines restricted-access space.", credit: "MedIntel Atlas — educational diagram" },
          { kind: "list", items: [
            "Zone I: freely accessible public areas.",
            "Zone II: greeting and screening; under MR personnel supervision.",
            "Zone III: restricted; controlled access; the 5-gauss line is contained here.",
            "Zone IV: the scanner room itself.",
          ]},
          { kind: "callout", tone: "warn", text: "MR safety policy is owned by an MR Medical Director and MR Safety Expert. This lesson is conceptual orientation only." },
        ],
      },
      {
        id: "mri-quench",
        title: "Quench pipe & cryogen access",
        minutes: 4,
        body: [
          { kind: "p", text: "Superconducting magnets are cooled by liquid helium. A quench is the sudden loss of superconductivity, which boils off helium very quickly. A dedicated quench pipe vents that gas to the outside — never into the scanner room." },
          { kind: "callout", tone: "warn", text: "Quench-pipe routing and cryogen delivery access are non-negotiable site-planning constraints. Ignoring them is a project-killer." },
        ],
      },
      {
        id: "mri-coils",
        title: "Coil inventory & storage",
        minutes: 3,
        body: [
          { kind: "p", text: "Each anatomy typically uses a dedicated receive coil (head, spine, body, knee, etc.). Plan storage close to the scanner room, on a non-ferromagnetic cart, with damage-tracking from day one — coils are expensive and fragile." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "Which lives inside Zone III/IV?",
        type: "multi",
        options: ["The scanner itself", "The 5-gauss line", "The general waiting area", "The quench pipe"],
        correct: [0, 1, 3],
        rationale: "The scanner room (IV), the contained fringe-field space (III), and the quench pipe routing all belong inside the controlled MR area.",
      },
      {
        q: "A quench releases…",
        type: "single",
        options: ["X-rays", "Helium gas", "Ultrasound waves"],
        correct: [1],
        rationale: "A quench rapidly boils off liquid helium that cools the superconducting magnet.",
      },
    ],
  },
  CT: {
    id: "ct-shielding-power",
    title: "CT shielding, power & contrast workflow",
    summary: "Lead-equivalent walls, three-phase power, injector logistics.",
    lessons: [
      {
        id: "ct-shielding",
        title: "Room shielding & control booth sightlines",
        minutes: 4,
        body: [
          { kind: "p", text: "CT rooms require shielding calculations performed by a medical physicist, considering workload, occupancy of adjacent areas, and scanner geometry. The control booth must maintain a clear line of sight to the patient." },
        ],
      },
      {
        id: "ct-contrast",
        title: "Power injector & contrast workflow",
        minutes: 4,
        body: [
          { kind: "p", text: "Most diagnostic CT studies use IV iodinated contrast delivered by a programmable power injector. The injector integrates with the scanner protocol so timing of bolus and acquisition is reproducible." },
          { kind: "callout", tone: "info", text: "Injector ↔ scanner integration is OEM-dependent; verify supported pairs before procurement." },
        ],
      },
      {
        id: "ct-dose-stewardship",
        title: "Dose stewardship: CTDIvol & DLP awareness",
        minutes: 4,
        body: [
          { kind: "p", text: "CTDIvol (mGy) and DLP (mGy·cm) are scanner output metrics — not patient doses. They are reported per acquisition and aggregated by dose-management software for quality programs." },
          { kind: "image", src: "/journey/diagram-ct-dose.svg", alt: "Conceptual diagram showing CTDIvol per slice multiplied by scan length to get DLP", caption: "CTDIvol (per-slice output) × scan length → DLP. Both are educational reference values.", credit: "MedIntel Atlas — educational diagram" },
        ],
      },
    ],
    checkpoint: [
      {
        q: "CTDIvol represents…",
        type: "single",
        options: ["The patient's effective dose", "Scanner output for a standard phantom", "The contrast volume injected"],
        correct: [1],
        rationale: "CTDIvol is a scanner output metric measured in a phantom — not a patient dose.",
      },
    ],
  },
  "X-ray": {
    id: "xr-room",
    title: "DR room: shielding, technique, ALARA",
    summary: "Lead, kVp/mA, exposure indicators.",
    lessons: [
      {
        id: "xr-shielding",
        title: "Room shielding & interlocks",
        minutes: 3,
        body: [
          { kind: "p", text: "DR rooms require lead-equivalent walls, leaded glass at the control window, and door interlocks that prevent exposure with the door open. Workload and occupancy of neighboring rooms drive the physicist's shielding calculation." },
        ],
      },
      {
        id: "xr-technique",
        title: "Technique factors: kVp, mA, time",
        minutes: 4,
        body: [
          { kind: "p", text: "Three knobs control radiographic exposure: kVp (penetration & contrast), mA (tube current), and exposure time. Modern systems automate via AEC (automatic exposure control), but technologists still need to understand when to override." },
        ],
      },
      {
        id: "xr-alara",
        title: "ALARA in practice",
        minutes: 3,
        body: [
          { kind: "p", text: "ALARA — As Low As Reasonably Achievable — is operationalized through collimation (smaller field = less scatter, less dose), correct technique selection, shielding sensitive organs when not in the field, and avoiding repeats by getting positioning right first time." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "Tight collimation primarily…",
        type: "single",
        options: ["Increases image noise", "Reduces scatter and patient dose", "Slows the exposure"],
        correct: [1],
        rationale: "Collimation restricts the beam to the area of interest, reducing scatter and unnecessary patient dose.",
      },
    ],
  },
  Ultrasound: {
    id: "us-room",
    title: "Ultrasound: ergonomics & probe care",
    summary: "Operator-dependent, probe-driven, hygiene-critical.",
    lessons: [
      {
        id: "us-ergonomics",
        title: "Ergonomics — sonographers' real occupational hazard",
        minutes: 3,
        body: [
          { kind: "p", text: "Repetitive strain injuries are endemic among sonographers. Adjustable beds, articulating monitors, supportive seating, and probe-grip discipline are not luxuries — they're a retention issue." },
        ],
      },
      {
        id: "us-probe-care",
        title: "Probe hygiene & inventory",
        minutes: 3,
        body: [
          { kind: "p", text: "Each probe has a manufacturer-approved cleaning level (low / intermediate / high-level disinfection) tied to its clinical use. Endocavitary probes always need high-level disinfection between patients." },
          { kind: "callout", tone: "warn", text: "Using the wrong disinfectant voids the probe warranty and can damage the lens — always check the OEM's compatibility list." },
        ],
      },
      {
        id: "us-image-quality",
        title: "Gain, TGC, and frame rate",
        minutes: 3,
        body: [
          { kind: "p", text: "Gain raises overall brightness; TGC compensates for depth-dependent attenuation; frame rate trades temporal resolution against beam density. These are the three knobs sonographers touch most." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "TGC compensates for…",
        type: "single",
        options: ["Operator hand tremor", "Depth-dependent attenuation", "Probe frequency drift"],
        correct: [1],
        rationale: "Time-Gain Compensation flattens echo brightness across depth.",
      },
    ],
  },
  Mammography: {
    id: "mammo-qc",
    title: "Mammography: compression, QC, audit",
    summary: "A modality run by its QC culture.",
    lessons: [
      {
        id: "mammo-compression",
        title: "Why compression matters",
        minutes: 3,
        body: [
          { kind: "p", text: "Compression reduces tissue overlap, lowers required dose, and freezes patient motion. It must be firm enough to be effective and gentle enough to be tolerable — patient-controlled compression is increasingly common." },
        ],
      },
      {
        id: "mammo-qc",
        title: "QC phantoms and the daily ritual",
        minutes: 4,
        body: [
          { kind: "p", text: "Mammography programs run daily phantom QC and document everything. The audit trail is part of accreditation in many jurisdictions; gaps in the log are gaps in compliance." },
        ],
      },
      {
        id: "mammo-dbt",
        title: "DBT: tomosynthesis basics",
        minutes: 3,
        body: [
          { kind: "p", text: "Digital Breast Tomosynthesis acquires multiple low-dose projections across a small angular range and reconstructs thin slices through the breast — reducing tissue overlap that masks lesions in 2D." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "Daily phantom QC in mammography is primarily…",
        type: "single",
        options: ["Optional tuning", "Required documentation tied to accreditation", "Performed only after service"],
        correct: [1],
        rationale: "Daily QC and its documentation underpin mammography accreditation programs.",
      },
    ],
  },
  "PET/CT": {
    id: "pet-tracer",
    title: "PET/CT: tracer logistics & alignment",
    summary: "Half-life math, uptake time, fusion.",
    lessons: [
      {
        id: "pet-tracer-flow",
        title: "From cyclotron to scanner",
        minutes: 5,
        body: [
          { kind: "p", text: "Most PET tracers (e.g., 18F-FDG) are produced by a cyclotron and delivered with a strict half-life clock running. Scheduling, dose calibration, and patient throughput are all governed by that clock." },
          { kind: "image", src: "/journey/diagram-petct-fusion.svg", alt: "Diagram showing PET activity overlaid on CT anatomy to produce a fused image", caption: "PET (function) + CT (anatomy) → fused image with attenuation correction.", credit: "MedIntel Atlas — educational diagram" },
        ],
      },
      {
        id: "pet-uptake",
        title: "Uptake room & quiet time",
        minutes: 3,
        body: [
          { kind: "p", text: "After tracer injection the patient rests in a dedicated uptake room (warm, quiet, dimly lit) for ~45–60 minutes for FDG. Movement and muscle activity during uptake distort the result." },
        ],
      },
      {
        id: "pet-fusion",
        title: "Why CT comes with the PET",
        minutes: 4,
        body: [
          { kind: "p", text: "The CT serves two purposes: anatomic localization of PET findings, and attenuation correction of the PET counts. Misalignment between PET and CT (often from breathing) is a known artifact — managed with gated acquisitions." },
        ],
      },
    ],
    checkpoint: [
      {
        q: "The CT in a PET/CT is used for…",
        type: "multi",
        options: ["Attenuation correction", "Anatomic localization", "Pure entertainment", "Tracer calibration"],
        correct: [0, 1],
        rationale: "The CT corrects PET counts for tissue attenuation and anatomically localizes uptake.",
      },
    ],
  },
};

const MODALITY_USE_OVERLAY: Record<Modality, Chapter> = {
  MRI: {
    id: "mri-use",
    title: "MR-specific use flow",
    summary: "Screening, coil selection, sequence planning.",
    lessons: [
      { id: "mri-screening", title: "MR safety screening checklist", minutes: 4, body: [
        { kind: "p", text: "Screen for: cardiac devices, neurostimulators, cochlear implants, programmable shunts, ferromagnetic foreign bodies (especially intra-orbital), recent surgical clips, drug-delivery patches with metallic backing, and pregnancy (per institutional policy)." },
        { kind: "callout", tone: "warn", text: "When in doubt, hold the patient and call the MR Safety Expert. The cost of delay is trivial; the cost of a wrong call is catastrophic." },
      ]},
      { id: "mri-coil-select", title: "Choosing the right coil", minutes: 3, body: [
        { kind: "p", text: "Each anatomy has an OEM-specified coil (or coil combination). Wrong coil = wrong SNR profile = wasted scan. Coil choice is part of the protocol, not a technologist preference." },
      ]},
      { id: "mri-sequence-tradeoffs", title: "Parallel imaging & SAR awareness", minutes: 4, body: [
        { kind: "p", text: "Parallel imaging accelerates scans by exploiting multi-channel coil geometry — at the cost of SNR. SAR (specific absorption rate) caps how much RF energy can be deposited per unit body mass; the scanner enforces it automatically." },
      ]},
    ],
    checkpoint: [
      { q: "SAR limits…", type: "single", options: ["Magnetic field strength", "RF energy deposited in tissue", "Helium boil-off rate"], correct: [1], rationale: "SAR caps RF deposition to prevent tissue heating." },
    ],
  },
  CT: {
    id: "ct-use",
    title: "CT-specific use flow",
    summary: "Protocol selection, contrast timing, recon.",
    lessons: [
      { id: "ct-protocol", title: "Protocol selection & size-based dose modulation", minutes: 4, body: [
        { kind: "p", text: "Modern CT scanners auto-modulate tube current based on patient size (mA modulation) and selectable noise targets. Selecting the right pediatric or low-dose protocol is the technologist's first dose-control lever." },
      ]},
      { id: "ct-contrast-timing", title: "Contrast bolus timing", minutes: 4, body: [
        { kind: "p", text: "Bolus tracking ROI placement and trigger threshold determine whether you capture the arterial, venous, or delayed phase. Mistimed contrast is a non-diagnostic study and often a re-scan." },
      ]},
      { id: "ct-recon", title: "Iterative vs filtered back-projection", minutes: 3, body: [
        { kind: "p", text: "Filtered Back-Projection (FBP) is the classical reconstruction; iterative reconstruction (and now AI-based reconstruction) reduces noise, enabling lower-dose protocols. Vendor branding varies." },
      ]},
    ],
    checkpoint: [
      { q: "Iterative reconstruction is mainly used to…", type: "single", options: ["Speed up acquisition", "Reduce noise / enable lower dose", "Replace contrast"], correct: [1], rationale: "Iterative recon trades compute for noise reduction." },
    ],
  },
  "X-ray": {
    id: "xr-use",
    title: "DR-specific use flow",
    summary: "Positioning, AEC, exposure indicators.",
    lessons: [
      { id: "xr-positioning", title: "Positioning is the diagnostic", minutes: 3, body: [
        { kind: "p", text: "Most non-diagnostic chest films are positioning failures, not exposure failures. Standard projections (PA/lateral, AP supine, etc.) exist for a reason — deviations should be documented." },
      ]},
      { id: "xr-aec", title: "AEC (Automatic Exposure Control)", minutes: 3, body: [
        { kind: "p", text: "AEC ion chambers terminate the exposure once enough signal reaches the detector. Selecting the wrong chambers (e.g., spine chamber for a chest) gives a dark or light image — it's a positioning question, not an exposure one." },
      ]},
      { id: "xr-exposure-indicator", title: "Exposure indicators (EI / DI)", minutes: 3, body: [
        { kind: "p", text: "DR systems report an Exposure Index per image. Drift in EI over time indicates technique drift or detector issues — track it as a QC signal, not just an artifact of a single study." },
      ]},
    ],
    checkpoint: [
      { q: "An unexpectedly low Exposure Index suggests…", type: "single", options: ["Underexposure / technique drift", "Patient motion", "Wrong patient ID"], correct: [0], rationale: "EI tracks the radiation reaching the detector; persistent dips indicate technique or detector issues." },
    ],
  },
  Ultrasound: {
    id: "us-use",
    title: "Ultrasound-specific use flow",
    summary: "Probe choice, image labeling, Doppler.",
    lessons: [
      { id: "us-probe-choice", title: "Probe frequency = depth tradeoff", minutes: 3, body: [
        { kind: "p", text: "Higher-frequency probes (e.g., 12 MHz) give better resolution but penetrate less. Lower-frequency curved probes (e.g., 3.5 MHz) reach deep abdomen at lower resolution. Choose by the target depth." },
      ]},
      { id: "us-labeling", title: "Image labeling & worksheet discipline", minutes: 3, body: [
        { kind: "p", text: "Ultrasound is operator-dependent; the worksheet and image labels are how the radiologist reconstructs what the sonographer saw. Label every image with anatomy and orientation." },
      ]},
      { id: "us-doppler", title: "Doppler basics", minutes: 4, body: [
        { kind: "p", text: "Color Doppler shows direction and average velocity; spectral Doppler quantifies velocity over time. Angle correction matters — beam-to-flow angles >60° degrade quantitative accuracy." },
      ]},
    ],
    checkpoint: [
      { q: "Higher probe frequency yields…", type: "single", options: ["Better resolution, less penetration", "Better penetration, less resolution", "Both better"], correct: [0], rationale: "High frequency = high resolution but rapid attenuation." },
    ],
  },
  Mammography: {
    id: "mammo-use",
    title: "Mammography-specific use flow",
    summary: "Standard views, compression dialogue, recall workflow.",
    lessons: [
      { id: "mammo-views", title: "Standard CC + MLO views", minutes: 3, body: [
        { kind: "p", text: "Screening exams use Cranio-Caudal (CC) and Medio-Lateral Oblique (MLO) views per breast. Diagnostic exams add spot-compression, magnification, or DBT as needed." },
      ]},
      { id: "mammo-compression-dialogue", title: "The compression conversation", minutes: 3, body: [
        { kind: "p", text: "Communication is the technique. Explaining what compression does, signaling each step, and offering patient-controlled compression dramatically improves both image quality and patient experience." },
      ]},
      { id: "mammo-recall", title: "Recall workflow & BI-RADS pipeline", minutes: 4, body: [
        { kind: "p", text: "A recall from screening is not a diagnosis — it's a request for additional imaging. BI-RADS categorizes findings to standardize follow-up; the workflow that gets a patient back in for diagnostic views is itself a quality metric." },
      ]},
    ],
    checkpoint: [
      { q: "A screening recall means…", type: "single", options: ["Cancer diagnosed", "Additional imaging needed", "Equipment failure"], correct: [1], rationale: "Recall is a request for further evaluation, not a diagnosis." },
    ],
  },
  "PET/CT": {
    id: "petct-use",
    title: "PET/CT-specific use flow",
    summary: "Tracer ordering, glucose checks, motion.",
    lessons: [
      { id: "petct-ordering", title: "Ordering against the half-life clock", minutes: 4, body: [
        { kind: "p", text: "Tracer doses are calibrated to a specific scan time. Schedule changes ripple through the entire day — the radiopharmacy can't simply re-make a dose." },
      ]},
      { id: "petct-prep", title: "Patient prep: glucose, fasting, hydration", minutes: 3, body: [
        { kind: "p", text: "For 18F-FDG, elevated blood glucose competes with the tracer and reduces image quality. Fasting and a glucose check are routine prep steps." },
      ]},
      { id: "petct-motion", title: "Breathing motion & alignment", minutes: 3, body: [
        { kind: "p", text: "PET is acquired over minutes; CT in seconds. Breathing-motion mismatch produces a banana-shaped artifact at the dome of the liver — managed with breath-hold protocols or respiratory gating." },
      ]},
    ],
    checkpoint: [
      { q: "Why fast before an FDG PET?", type: "single", options: ["To reduce nausea", "Glucose competes with FDG uptake", "To shorten scan time"], correct: [1], rationale: "Elevated glucose competes with FDG, degrading image quality." },
    ],
  },
};

const MODALITY_ELEMENTS: Record<Modality, ElementTile[]> = {
  MRI: [
    { id: "mri-magnet", name: "Superconducting magnet", layer: "Modality", category: "Hardware", blurb: "1.5T or 3T whole-body cryostat.", detail: "Cooled by liquid helium; the static field is always on, even when 'off'." },
    { id: "mri-gradient", name: "Gradient amplifiers", layer: "Modality", category: "Hardware", blurb: "Spatially encode the MR signal.", detail: "Audible 'knocking' during scans is the gradient coils switching at high speed." },
    { id: "mri-coil-set", name: "Receive coil set", layer: "Modality", category: "Hardware", blurb: "Anatomy-specific RF receivers.", detail: "Head, spine, body, extremity, breast, cardiac — each with its own SNR profile." },
    { id: "mri-injector", name: "MR-conditional injector", layer: "Modality", category: "Hardware", blurb: "Gadolinium contrast delivery.", detail: "MR-conditional means safe under specified conditions — always verify the conditions." },
    { id: "mri-quench-pipe", name: "Quench pipe", layer: "Modality", category: "Hardware", blurb: "Vents helium gas to the outside.", detail: "Routing is a hard site-planning constraint; cannot run through occupied space." },
  ],
  CT: [
    { id: "ct-tube", name: "X-ray tube", layer: "Modality", category: "Hardware", blurb: "Generates the X-ray beam.", detail: "High-wear, high-cost component; usually a major line item in service contracts." },
    { id: "ct-detector", name: "Multi-row detector", layer: "Modality", category: "Hardware", blurb: "Captures projections each rotation.", detail: "More rows = wider z-axis coverage per rotation = faster volume coverage." },
    { id: "ct-injector", name: "Power injector", layer: "Modality", category: "Hardware", blurb: "Programmable contrast delivery.", detail: "Integrates with the scanner protocol for reproducible bolus timing." },
    { id: "ct-dose-mgr", name: "Dose-management software", layer: "Workstation", category: "Software", blurb: "Aggregates CTDIvol/DLP per study.", detail: "Feeds quality programs and benchmarks against diagnostic reference levels." },
  ],
  "X-ray": [
    { id: "xr-detector", name: "Wireless DR detector", layer: "Modality", category: "Hardware", blurb: "Battery-powered flat panel.", detail: "Improves portable workflow; track battery health and drop-protection." },
    { id: "xr-generator", name: "High-frequency generator", layer: "Modality", category: "Hardware", blurb: "Converts mains to controlled X-ray exposure.", detail: "Modern HF generators give precise, short exposures for crisp images." },
    { id: "xr-grid", name: "Anti-scatter grid", layer: "Modality", category: "Hardware", blurb: "Removes scattered photons.", detail: "Improves contrast at the cost of slightly higher patient dose; selectable per exam." },
  ],
  Ultrasound: [
    { id: "us-probes", name: "Probe library", layer: "Modality", category: "Hardware", blurb: "Linear, curved, phased, endocavitary.", detail: "Frequency, footprint, and connector vary; each probe is calibrated to the system." },
    { id: "us-cart", name: "Cart & ergonomics package", layer: "Modality", category: "Hardware", blurb: "Adjustable monitor, keyboard, seating.", detail: "Sonographer ergonomics is a workforce retention issue — invest accordingly." },
    { id: "us-disinfection", name: "High-level disinfection station", layer: "Workstation", category: "Hardware", blurb: "For endocavitary probes.", detail: "Manufacturer-approved disinfectants only; document each cycle for traceability." },
  ],
  Mammography: [
    { id: "mammo-paddle", name: "Compression paddles", layer: "Modality", category: "Hardware", blurb: "Sized to view and breast.", detail: "Worn paddles are a recall driver; track and replace per OEM guidance." },
    { id: "mammo-phantom", name: "ACR / equivalent phantom", layer: "Modality", category: "Hardware", blurb: "Daily QC reference.", detail: "Drives the daily QC ritual that underpins accreditation." },
    { id: "mammo-cad", name: "CAD / AI triage", layer: "Workstation", category: "Software", blurb: "Reader-assist marker software.", detail: "Adjunctive only; never replaces the radiologist's read." },
  ],
  "PET/CT": [
    { id: "petct-detector", name: "PET detector ring", layer: "Modality", category: "Hardware", blurb: "Detects 511 keV annihilation photons.", detail: "Time-of-flight (TOF) capability improves image quality." },
    { id: "petct-uptake-room", name: "Uptake room", layer: "Modality", category: "Hardware", blurb: "Quiet, warm, dim.", detail: "Patient muscle activity during uptake distorts FDG distribution." },
    { id: "petct-radiopharmacy", name: "Radiopharmacy interface", layer: "Network", category: "Ecosystem", blurb: "Tracer ordering & decay tracking.", detail: "Doses are calibrated to a specific scan time; schedules and tracer logistics are tightly coupled." },
  ],
};

/* ----------------------------- assembly ----------------------------- */

export function curriculumFor(modality: Modality): Curriculum {
  return {
    modality,
    overview: MODALITY_OVERVIEW[modality],
    setup: [...SETUP_SPINE, MODALITY_SETUP_OVERLAY[modality]],
    use: [...USE_SPINE, MODALITY_USE_OVERLAY[modality]],
    elements: [...SHARED_ELEMENTS, ...MODALITY_ELEMENTS[modality]],
    glossary: SHARED_GLOSSARY,
    resources: SHARED_RESOURCES,
  };
}

export function totalLessons(c: Curriculum): number {
  return c.setup.reduce((n, ch) => n + ch.lessons.length, 0) + c.use.reduce((n, ch) => n + ch.lessons.length, 0);
}

export function estimatedMinutes(c: Curriculum): number {
  const sum = (chs: Chapter[]) => chs.reduce((n, ch) => n + ch.lessons.reduce((m, l) => m + l.minutes, 0), 0);
  return sum(c.setup) + sum(c.use);
}
