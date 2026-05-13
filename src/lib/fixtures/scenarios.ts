// Teaching scenarios per modality — illustrative only, not patient-specific.
// Focus: how scan data are read in context, what quantities mean, and prudent follow-up
// communication pathways. Not clinical decision support; no procedure/fatality statistics.
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
  /** How the output is usually approached on read (educational). */
  readingFramework: string;
  patientJourney: ScenarioStep[];
  acquisition: { name: string; description: string; figures: { src: string; caption: string }[] };
  imageGuide: AnnotatedFigure;
  metrics: ScenarioMetric[];
  nextSteps: string[];
  videoPoster?: string;
  videoCaptions: string[];
}

const MRI_BRAIN: Scenario = {
  id: "mri-brain-routine",
  name: "Routine brain MRI (non-contrast)",
  shortDescription: "Multi-sequence brain MRI for common neurological indications — teaching read focused on how sequence data complement each other.",
  readingFramework:
    "Readers cross-check anatomy (T1), fluid-sensitive signal (FLAIR), and diffusion (DWI/ADC maps) before synthesizing an impression. This demo explains what each dataset contributes—not a real read.",
  patientJourney: [
    { label: "Arrival & screening", body: "MR safety screening; order verification; metal / device questionnaire." },
    { label: "Consent & coaching", body: "Noise, duration, and stillness explained; hearing protection; emergency squeeze bulb." },
    { label: "Positioning", body: "Supine, head-first, head/neck coil with foam pads; chin neutral; eyes closed to reduce motion." },
    { label: "Environment", body: "Lights dimmed; intercom check; Zone IV access controlled." },
    { label: "Acquisition", body: "Localizer, then T1, T2, FLAIR, DWI (and derived ADC). Typical slot 15–25 minutes for a routine protocol." },
    { label: "Handoff", body: "Images to PACS; technologist QC for motion/artifact; radiologist worklist." },
  ],
  acquisition: {
    name: "T1, T2, FLAIR, DWI (+ ADC map)",
    description: "Structural sequences plus diffusion-weighted data to separate vasogenic edema patterns from restricted diffusion patterns in teaching materials.",
    figures: [
      { src: "/journey/mri-sagittal.jpg", caption: "Educational schematic — not a patient scan; illustrates contrast concepts." },
    ],
  },
  imageGuide: {
    src: "/journey/mri-sagittal.jpg",
    alt: "Educational brain MRI schematic",
    caption: "Hotspots: conceptual regions teachers use when explaining what each sequence emphasizes on a brain study.",
    hotspots: [
      { xPct: 48, yPct: 38, label: "Cortical ribbon (T1)", note: "T1 highlights anatomy and fat; cortical thickness and symmetry are compared side-to-side." },
      { xPct: 52, yPct: 52, label: "Periventricular FLAIR", note: "FLAIR suppresses CSF signal so subtle periventricular signal changes are easier to see than on T2 alone." },
      { xPct: 44, yPct: 62, label: "Deep white matter", note: "Non-specific T2/FLAIR hyperintensities are common; age, vascular risk, and pattern (punctate vs confluent) frame differential thinking—not a diagnosis here." },
      { xPct: 56, yPct: 48, label: "DWI/ADC correlation", note: "True restricted diffusion (bright on DWI, dark on ADC) suggests cytotoxic edema in teaching cases; readers correlate with ADC map, not DWI alone." },
    ],
  },
  metrics: [
    {
      metric: "ADC (illustrative ROI)",
      measures: "Apparent diffusion coefficient from DWI",
      typicalRange: "Healthy cortex roughly ~700–1000 ×10⁻³ mm²/s (field/vendor dependent)",
      exampleValue: "~820 ×10⁻³ mm²/s",
      deviation: "Very low ADC with matching DWI hyperintensity raises concern for acute ischemia in teaching curricula—urgent clinician communication follows local critical-results policy.",
    },
    {
      metric: "FLAIR hyperintensity load",
      measures: "Visual / qualitative burden of white-matter T2 hyperintensity on FLAIR",
      typicalRange: "None to mild scattered foci often age-related in teaching examples",
      exampleValue: "Few punctate foci",
      deviation: "Confluent or atypical distribution prompts correlation with history and prior imaging; additional sequences may be requested per protocol.",
    },
    {
      metric: "Midline position",
      measures: "Septum pellucidum / falx alignment",
      typicalRange: "Midline without shift in teaching normals",
      exampleValue: "No shift",
      deviation: "Shift or mass effect on any sequence is treated as a potential critical finding in many institutions—immediate radiologist-to-clinician communication per policy.",
    },
    {
      metric: "Motion / ghosting",
      measures: "Image quality on phase-encoded axes",
      typicalRange: "Minimal artifact after coaching",
      exampleValue: "Mild ghosting",
      deviation: "Degrades small-structure assessment; readers may recommend repeat limited study or alternative plane acquisition.",
    },
  ],
  nextSteps: [
    "Ordering clinician integrates the structured report with symptoms, exam, and labs—this prototype never replaces that judgment.",
    "Unexpected discrepancy between FLAIR abnormality and DWI/ADC pattern often triggers repeat DWI, gradient echo/SWI, or contrast-enhanced MRI per institutional algorithm.",
    "Findings that meet your site's **critical results** definition (e.g., acute large-vessel pattern, herniation, new large mass effect) should generate same-day notification pathways where those policies exist.",
    "Patients with questions about findings should discuss them with their treating physician or nurse line—not with imaging staff in isolation.",
    "Prior outside studies, when available, are compared for interval change; lack of priors may widen the differential in the report narrative.",
  ],
  videoCaptions: [
    "Localizer and landmarking…",
    "T1 anatomical survey…",
    "FLAIR fluid-sensitive stack…",
    "DWI + ADC map reconstruction…",
    "Technologist QC for motion…",
    "Images on PACS; radiologist begins structured read…",
    "Report released to EMR per site workflow.",
  ],
};

const MRI_SPINE: Scenario = {
  id: "mri-lumbar-spine",
  name: "Lumbar spine MRI (radiculopathy protocol)",
  shortDescription: "Sagittal and axial imaging of the lumbar spine — teaching focus on disc–nerve relationships and canal measurements.",
  readingFramework:
    "Readers systematically grade discs, canal/foraminal narrowing, and nerve root appearance on T2/STIR sagittals and T2 axials through each level. Educational material stresses level-by-level documentation.",
  patientJourney: [
    { label: "Screening & positioning", body: "MR safety; supine with lumbar cushion; surface coil over lower back." },
    { label: "Sequences", body: "Typical: sagittal T1/T2 (± STIR), axial T2 through L1–S1; some sites add coronal or angled axial to nerve roots." },
    { label: "Breathing / motion", body: "Free-breathing; patient coached to stay still—respiratory motion less than thoracic spine but swallowing still avoided." },
    { label: "Completion", body: "QC for scoliosis rotation; entire conus included on sagittals per protocol." },
  ],
  acquisition: {
    name: "Sagittal + axial T2-dominant lumbar protocol",
    description: "High-resolution T2 highlights CSF around the cauda equina and exiting roots; T1 adds marrow and foraminal fat contrast for teaching reads.",
    figures: [{ src: "/journey/mri-sagittal.jpg", caption: "Generic schematic stand-in — real spine MR uses dedicated spine coil and smaller FOV." }],
  },
  imageGuide: {
    src: "/journey/mri-sagittal.jpg",
    alt: "Stand-in schematic for spine teaching",
    caption: "Hotspots label what radiologists annotate on true sagittal/axial spine series (conceptual overlay).",
    hotspots: [
      { xPct: 50, yPct: 42, label: "Disc space", note: "Height, signal (desiccation), and contour (bulge vs focal protrusion) are described level-by-level." },
      { xPct: 46, yPct: 58, label: "Central canal", note: "Thecal sac CSF signal on T2; central stenosis reduces CSF ring on axial images in teaching examples." },
      { xPct: 58, yPct: 55, label: "Foramen / exiting root", note: "Fat effacement or root edema suggests foraminal stenosis or impingement—correlated with clinical dermatomes." },
      { xPct: 52, yPct: 72, label: "Conus region", note: "Sagittal coverage must include conus; unexpected signal there shifts differential toward non-mechanical causes in teaching cases." },
    ],
  },
  metrics: [
    {
      metric: "Central canal AP dimension (teaching)",
      measures: "Subjective or measured sagittal/axial narrowing",
      typicalRange: "Institution-specific thresholds; many teaching texts cite qualitative mild/moderate/severe",
      exampleValue: "Mild narrowing L4–5",
      deviation: "Progressive symptoms or red flags (bowel/bladder, cancer history) change urgency of clinical follow-up regardless of imaging alone.",
    },
    {
      metric: "Disc desiccation",
      measures: "Loss of T2 signal in nucleus",
      typicalRange: "Common with age",
      exampleValue: "Multilevel mild",
      deviation: "Correlates with mechanics but does not equal pain generator by itself—clinical correlation required.",
    },
    {
      metric: "Nerve root edema",
      measures: "T2 hyperintensity in root",
      typicalRange: "Absent in asymptomatic teaching normals",
      exampleValue: "None illustrated",
      deviation: "When present, readers often comment on likely mechanical impingement level and suggest targeted clinical exam.",
    },
    {
      metric: "Modic endplate change",
      measures: "Vertebral body marrow signal adjacent to disc",
      typicalRange: "Type I–III patterns in degenerative spectrum (teaching nomenclature)",
      exampleValue: "Type II at L5–S1 (illustrative)",
      deviation: "Interpreted as chronic stress/inflammatory-degenerative spectrum; clinical relevance varies—no isolated imaging decision.",
    },
  ],
  nextSteps: [
    "Symptom–level correlation: which root distribution matches the reported level?",
    "Physical therapy / pain management / specialist referral timing is decided clinically; imaging documents anatomy.",
    "Emergent evaluation if cauda equina syndrome is suspected clinically—imaging supports but does not replace history and exam.",
    "Prior MRI comparison highlights interval disc herniation or stenosis progression when available.",
  ],
  videoCaptions: [
    "Patient positioned — lumbar coil…",
    "Sagittal T2 stack…",
    "Axial T2 through each disc…",
    "Radiologist scrolls level-by-level…",
    "Structured report: levels, discs, canal, roots…",
    "Released to EMR.",
  ],
};

const CT_CHEST: Scenario = {
  id: "ct-chest-routine",
  name: "Routine chest CT (non-contrast)",
  shortDescription: "Helical chest CT reconstructed in lung and mediastinal windows — teaching read on parenchyma, airways, and incidental soft tissues.",
  readingFramework:
    "Lung-window review hunts nodules, consolidation, and interstitial patterns; mediastinal window evaluates nodes, vessels, and incidental masses. HU values and morphology drive impressions in teaching.",
  patientJourney: [
    { label: "Verification", body: "Identity, indication, pregnancy screening where applicable; radiation counseling as per policy." },
    { label: "Positioning", body: "Supine, arms up, cradle support; scout topogram." },
    { label: "Breath-hold", body: "End-inspiration coaching; repeat if motion degrades bases." },
    { label: "Acquisition", body: "Helical thorax; sub-minute scan typical; reconstructions at multiple slice thicknesses / kernels." },
    { label: "Reconstruction", body: "Lung kernel + soft-tissue kernel series sent to PACS." },
  ],
  acquisition: {
    name: "Helical chest CT — lung + mediastinal reconstructions",
    description: "Dual-window review is standard: high-frequency kernel emphasizes lung detail; smoother kernel aids mediastinal and liver dome assessment.",
    figures: [{ src: "/journey/ct.jpg", caption: "Dose schematic — paired with windowing teaching below." }],
  },
  imageGuide: {
    src: "/journey/ct.jpg",
    alt: "Teaching overlay for CT review concepts",
    caption: "Hotspots map to **how** readers switch contexts—not literal lung anatomy on this diagram.",
    hotspots: [
      { xPct: 25, yPct: 40, label: "Lung window", note: "Wide window/level makes air–soft-tissue interfaces obvious; ground-glass and tree-in-bud patterns are searched." },
      { xPct: 55, yPct: 60, label: "Mediastinal window", note: "Narrower window evaluates nodes, aorta, esophagus, and upper abdominal organs included on thorax CT." },
      { xPct: 78, yPct: 35, label: "Pleural line", note: "Pneumothorax, effusion, and pleural thickening are assessed on both windows in teaching reads." },
    ],
  },
  metrics: [
    {
      metric: "Pulmonary nodule HU (solid)",
      measures: "Attenuation on thin slices",
      typicalRange: "Soft-tissue nodules often roughly +30 to +70 HU (broad teaching range)",
      exampleValue: "+55 HU (illustrative)",
      deviation: "Fat-density (−30 to −100 HU) suggests hamartoma in classic teaching; calcification patterns inform stability assessment with priors.",
    },
    {
      metric: "Ground-glass opacity extent",
      measures: "Subjective % lobe involvement in teaching",
      typicalRange: "None in normal example",
      exampleValue: "None",
      deviation: "Patchy GGO triggers infection vs edema vs neoplasm differential—clinical context and labs essential; short-interval follow-up CT may be recommended in guidelines for subsolid lesions.",
    },
    {
      metric: "Aortic diameter (ascending)",
      measures: "Double-oblique measurement when indicated",
      typicalRange: "Institution-specific; teaching often cites >4.0–4.5 cm as threshold for closer surveillance",
      exampleValue: "3.2 cm (illustrative)",
      deviation: "Rapid change vs priors or symptoms may escalate communication even below textbook thresholds.",
    },
    {
      metric: "Image noise / quality",
      measures: "mAs, BMI, kernel trade-off",
      typicalRange: "Diagnostic noise index per QC program",
      exampleValue: "Acceptable (illustrative)",
      deviation: "Excess noise limits small-nodule detection; readers may note limited sensitivity in the report.",
    },
  ],
  nextSteps: [
    "Lung-RADS–style structured follow-up applies only where that program is adopted—reports should state the classification used.",
    "Incidental thyroid, adrenal, or renal findings often trigger dedicated ultrasound or contrast CT pathways per ACR-type incidental follow-up guides (educational reference only).",
    "Critical result examples in teaching: tension pneumothorax, massive PE (if CTA), acute aortic syndrome—each institution defines who is called and how fast.",
    "Patients should not infer cancer risk from raw images; the written impression and clinician discussion carry meaning.",
  ],
  videoCaptions: [
    "Topogram…",
    "Breath-hold helical pass…",
    "Lung-window reconstruction…",
    "Mediastinal window reconstruction…",
    "Radiologist nodule search / CAD adjunct if present…",
    "Report + incidental findings paragraph…",
  ],
};

const CT_PE: Scenario = {
  id: "ct-pa-chest",
  name: "CT pulmonary angiography (teaching)",
  shortDescription: "Contrast-enhanced CTA optimized for pulmonary arterial opacification — teaching focus on bolus timing and clot interpretation concepts.",
  readingFramework:
    "Readers assess main through subsegmental arteries for filling defects and for confounds (motion, beam hardening from contrast in SVC). Clinical pretest probability tools are used outside the scanner.",
  patientJourney: [
    { label: "Prep", body: "IV access; renal function / allergy history per policy; breath-hold coaching." },
    { label: "Contrast", body: "Bolus tracked or timed; caudocranial acquisition common to reduce respiratory motion at bases." },
    { label: "Acquisition", body: "Thin collimation; reconstructions for MIP/MPR often used on workstation." },
    { label: "Post-processing", body: "Radiologist uses MPR to follow vessel branches in teaching." },
  ],
  acquisition: {
    name: "Helical CTA thorax after iodinated contrast",
    description: "Peak enhancement in main PA is goal; poor timing mimics filling defects in teaching pitfalls.",
    figures: [{ src: "/journey/ct.jpg", caption: "Dose / timing teaching schematic — not a CTA image." }],
  },
  imageGuide: {
    src: "/journey/ct.jpg",
    alt: "CTA teaching overlay",
    caption: "Conceptual labels for what reviewers scrutinize on true CTA series.",
    hotspots: [
      { xPct: 30, yPct: 35, label: "Main PA enhancement", note: "Homogeneous enhancement suggests good bolus; poor enhancement limits diagnostic confidence." },
      { xPct: 52, yPct: 50, label: "Filling defect pattern", note: "Acute clot classically appears as low-attenuation defect surrounded by bright contrast—correlated with clot burden scoring systems in teaching." },
      { xPct: 72, yPct: 45, label: "Lymph node / artifact", note: "Beam hardening from dense contrast in SVC can mimic defects; MPR and window adjustment reduce false positives." },
    ],
  },
  metrics: [
    {
      metric: "Main PA Hounsfield units",
      measures: "Contrast enhancement surrogate",
      typicalRange: "Institution-specific HU targets post-bolus",
      exampleValue: "~350 HU (illustrative)",
      deviation: "Low values may indicate mistimed bolus—readers caveat interpretation and sometimes recommend repeat if clinically warranted.",
    },
    {
      metric: "RV/LV ratio (teaching)",
      measures: "Strain on right heart in massive PE curricula",
      typicalRange: "Normal teaching example <1",
      exampleValue: "0.8 (illustrative)",
      deviation: "Elevated ratio plus clot burden may trigger critical communication pathways for hemodynamic concern—clinical assessment first.",
    },
    {
      metric: "Subsegmental clot burden",
      measures: "Qualitative branch involvement",
      typicalRange: "None in negative teaching case",
      exampleValue: "None",
      deviation: "Isolated subsegmental findings have high false-positive rate on single-phase CTA; readers integrate Wells score and D-dimer context.",
    },
    {
      metric: "Dose length product",
      measures: "DLP",
      typicalRange: "Protocol-dependent",
      exampleValue: "—",
      deviation: "Tracked for registry/QA; does not change acute clot interpretation but informs protocol refinement.",
    },
  ],
  nextSteps: [
    "Positive CTA in teaching prompts anticoagulation decisions by the treating team using validated risk tools—not by lay interpretation of images.",
    "Negative CTA does not fully exclude PE in every clinical scenario; residual uncertainty is sometimes documented with recommendations for serial imaging or ultrasound.",
    "Critical activation when massive PE or right heart strain is suspected follows hospital emergency protocols.",
  ],
  videoCaptions: [
    "Contrast injection — bolus tracking…",
    "Breath-hold CTA acquisition…",
    "MPR review of segmental branches…",
    "Comparison with prior if any…",
    "Structured report + critical value pathway if triggered…",
  ],
};

const XR_CHEST: Scenario = {
  id: "xr-chest-pa",
  name: "Chest X-ray (PA / lateral)",
  shortDescription: "Erect two-view chest — teaching interpretation of lungs, pleura, heart silhouette, and bones on projection imaging.",
  readingFramework:
    "Systematic ABCDE-style search patterns are taught: airways, breathing, circulation, diaphragm, everything else (bones, soft tissues). Two views separate anterior vs posterior structures.",
  patientJourney: [
    { label: "Preparation", body: "Jewelry removed; gown; pregnancy check." },
    { label: "PA view", body: "Chin up, shoulders rolled forward, hands on hips—scapulae lateral." },
    { label: "Lateral", body: "Left lateral conventional; 5–10° inspiration for both." },
    { label: "QC", body: "Penetration, rotation, inspiration count ribs; repeat if inadequate." },
  ],
  acquisition: {
    name: "PA + lateral chest radiograph",
    description: "Low-dose projection; magnification of anterior structures on lateral view is a teaching pitfall.",
    figures: [{ src: "/journey/xray.jpg", caption: "Chest X-ray — educational." }],
  },
  imageGuide: {
    src: "/journey/xray.jpg",
    alt: "Chest X-ray teaching",
    caption: "On a real chest film, hotspots would sit on hilum, costophrenic angles, etc.—here the diagram only anchors **review steps**.",
    hotspots: [
      { xPct: 22, yPct: 42, label: "Trachea / carina", note: "Midline trachea deviation suggests mass, atelectasis, or tension physiology in teaching examples." },
      { xPct: 50, yPct: 48, label: "Hilar contours", note: "Symmetry and density compared; adenopathy vs projection overlap." },
      { xPct: 48, yPct: 68, label: "Costophrenic angles", note: "Blunting suggests pleural fluid on erect film when meniscus present." },
      { xPct: 75, yPct: 55, label: "Retrocardiac region", note: "Lateral view exposes left lower lobe consolidations hidden behind the heart on PA." },
    ],
  },
  metrics: [
    {
      metric: "Cardiothoracic ratio (PA)",
      measures: "Cardiac width / thoracic width",
      typicalRange: "Teaching often uses <0.50 adult PA erect as rough guide",
      exampleValue: "0.47 (illustrative)",
      deviation: "Patient rotation or low inspiration falsely widens heart; readers correct technique before overcalling cardiomegaly.",
    },
    {
      metric: "Rib inspiration count",
      measures: "Posterior ribs visible above diaphragm",
      typicalRange: "Often ≥9–10 posterior ribs taught as adequate inspiration",
      exampleValue: "10 ribs",
      deviation: "Poor inspiration crowds lung markings and mimics interstitial abnormality.",
    },
    {
      metric: "Penetration",
      measures: "Ability to see spine through heart",
      typicalRange: "Faint thoracic spine visible through cardiac shadow on PA when properly penetrated",
      exampleValue: "Adequate (illustrative)",
      deviation: "Underpenetration hides nodules; overpenetration loses subtle infiltrates.",
    },
    {
      metric: "Silhouette sign (concept)",
      measures: "Border loss with adjacent opacity",
      typicalRange: "Sharp borders expected when no contiguous consolidation",
      exampleValue: "Normal silhouette teaching case",
      deviation: "Loss of right heart border suggests right middle lobe process in classic teaching localization.",
    },
  ],
  nextSteps: [
    "Abnormal chest X-ray in outpatient setting usually leads to ordering-provider callback and often CT chest for characterization—timing per symptom severity.",
    "Pneumothorax or large effusion may be communicated as critical results per institutional list.",
    "Normal film does not exclude pulmonary embolism or early pneumonia—clinical follow-up remains important.",
  ],
  videoCaptions: [
    "PA positioning…",
    "Exposure…",
    "Lateral setup…",
    "QC at technologist station…",
    "Radiologist systematic review…",
    "Report to EMR.",
  ],
};

const XR_KNEE: Scenario = {
  id: "xr-knee-wb",
  name: "Weight-bearing knee radiographs (teaching)",
  shortDescription: "Standing AP and lateral knee — teaching focus on joint-space narrowing, alignment, and fracture exclusion.",
  readingFramework:
    "MSK readers grade compartment joint space, osteophytes, subchondral changes, and alignment (varus/valgus). Fracture lines and effusions are sought on lateral.",
  patientJourney: [
    { label: "Positioning", body: "Standing AP both knees together or single; lateral with flexion as protocol allows." },
    { label: "Exposure", body: "Low-dose technique; patella profile view sometimes added for patellofemoral symptoms." },
  ],
  acquisition: {
    name: "AP standing + lateral knee",
    description: "Weight-bearing views accentuate cartilage loss compared with supine films in teaching comparisons.",
    figures: [{ src: "/journey/xray.jpg", caption: "Knee X-ray — educational." }],
  },
  imageGuide: {
    src: "/journey/xray.jpg",
    alt: "Knee X-ray teaching",
    caption: "Conceptual hotspots for what is measured on real knee films.",
    hotspots: [
      { xPct: 35, yPct: 45, label: "Medial compartment", note: "Joint-space width compared to lateral side; asymmetry suggests medial osteoarthritis pattern in teaching." },
      { xPct: 62, yPct: 45, label: "Lateral compartment", note: "Preserved space with medial loss = varus osteoarthritis pattern." },
      { xPct: 50, yPct: 65, label: "Patella / effusion", note: "Lateral view shows suprapatellar distension suggesting effusion; lipohemarthrosis hints intra-articular fracture in trauma teaching." },
    ],
  },
  metrics: [
    {
      metric: "Joint-space width (qualitative)",
      measures: "Compartment symmetry",
      typicalRange: "Roughly symmetric in young teaching normals",
      exampleValue: "Medial narrowing (illustrative)",
      deviation: "Guides conservative therapy vs specialist referral in clinical practice—imaging describes structural severity, not functional disability alone.",
    },
    {
      metric: "Kellgren-Lawrence grade (teaching)",
      measures: "Osteoarthritis severity scale 0–4",
      typicalRange: "0–1 minimal",
      exampleValue: "Grade 3 (illustrative)",
      deviation: "Higher grades correlate with symptoms imperfectly; used for cohort research and clinical context more than isolation.",
    },
    {
      metric: "Tibial plateau fracture line",
      measures: "Cortical disruption",
      typicalRange: "Absent",
      exampleValue: "None",
      deviation: "Subtle impacted fractures may need MRI or CT if clinical suspicion remains high after negative X-ray.",
    },
    {
      metric: "Alignment (mechanical axis)",
      measures: "Varus / valgus on long-leg films when obtained",
      typicalRange: "Neutral in teaching example",
      exampleValue: "Mild varus",
      deviation: "Guides referral for alignment assessment when clinically indicated—multidisciplinary planning stays with treating teams.",
    },
  ],
  nextSteps: [
    "Primary care or orthopedics correlates imaging with function and exam; injections, PT, or advanced imaging follows clinical pathways.",
    "Trauma triage: if fracture suspected despite negative X-ray, MRI or CT per protocol.",
    "Patients with locked knee or neurovascular symptoms need emergency evaluation—clinical trigger, not film alone.",
  ],
  videoCaptions: [
    "Standing AP setup…",
    "Lateral flexed knee…",
    "Radiologist measures joint space…",
    "Report + clinical correlation note…",
  ],
};

const US_ABDO: Scenario = {
  id: "us-abdomen",
  name: "Abdominal ultrasound (survey)",
  shortDescription: "Curvilinear survey of liver, gallbladder, kidneys, aorta — teaching Doppler and grayscale interpretation concepts.",
  readingFramework:
    "Organ-by-organ sweep: liver echotexture, portal vein flow, GB wall and stones, hydronephrosis, AAA screening segment when indicated. Operator dependence is acknowledged in every report template.",
  patientJourney: [
    { label: "Prep", body: "Fasting for GB; bladder state per renal protocol." },
    { label: "Positioning", body: "Supine, decubitus rolls to interrogate GB and liver segments." },
    { label: "Acquisition", body: "Still images + cine clips; Doppler angles ≤60° in teaching for velocity accuracy." },
  ],
  acquisition: {
    name: "Grayscale + color Doppler abdominal survey",
    description: "Real-time cine documents dynamic findings (peristalsis, vascular patency).",
    figures: [{ src: "/journey/ultrasound.jpg", caption: "Abdominal ultrasound — educational." }],
  },
  imageGuide: {
    src: "/journey/ultrasound.jpg",
    alt: "Ultrasound teaching",
    caption: "What sonographers annotate on true organ sweeps (conceptual).",
    hotspots: [
      { xPct: 25, yPct: 40, label: "Liver echotexture", note: "Compared to renal cortex; steatosis brightens liver relative to kidney in teaching examples." },
      { xPct: 55, yPct: 48, label: "GB fossa", note: "Wall thickness, stones, Murphy sign correlation (clinical)." },
      { xPct: 78, yPct: 52, label: "Kidney collecting system", note: "Hydronephrosis graded mild–severe in teaching systems; ureteric jets in bladder when scanning bladder." },
    ],
  },
  metrics: [
    {
      metric: "Portal vein velocity",
      measures: "Spectral Doppler",
      typicalRange: "Teaching often cites ~15–30 cm/s at midline inhale (wide variability)",
      exampleValue: "22 cm/s (illustrative)",
      deviation: "Very low or hepatofugal flow raises portal hypertension differential—clinical labs and specialist follow-up.",
    },
    {
      metric: "GB wall thickness",
      measures: "Anterior wall caliper",
      typicalRange: "<3 mm distended in teaching normals",
      exampleValue: "2 mm",
      deviation: "Thick wall with pain may be acute cholecystitis pattern but hepatitis, heart failure, and postprandial state mimic—clinical correlation.",
    },
    {
      metric: "Main renal artery RI",
      measures: "Resistive index",
      typicalRange: "Institution-dependent; many cite <0.70 in native kidneys as rough teaching guide",
      exampleValue: "0.66 (illustrative)",
      deviation: "Elevated RI nonspecific—medical renal disease, obstruction, technical factors.",
    },
    {
      metric: "Aortic outer diameter",
      measures: "From outer wall to outer wall",
      typicalRange: "<3 cm abdominal aorta often cited as non-aneurysmal in screening teaching",
      exampleValue: "2.1 cm (illustrative)",
      deviation: "≥3 cm triggers surveillance intervals per vascular society guides—communicated to ordering provider.",
    },
  ],
  nextSteps: [
    "Incidental liver lesion may lead to contrast CT/MRI characterization algorithms (LI-RADS applies only in defined at-risk populations—educational caveat).",
    "Hydronephrosis prompts correlation for stone vs obstruction; urgent urology/nephrology if infected obstruction suspected clinically.",
    "AAA screening positives are high-priority clinician notifications in teaching pathways.",
  ],
  videoCaptions: [
    "RUQ grayscale sweep…",
    "GB long axis…",
    "Color Doppler portal…",
    "Renal poles + hydronephrosis check…",
    "Clips archived to PACS…",
  ],
};

const US_DVT: Scenario = {
  id: "us-lower-extremity-venous",
  name: "Lower-extremity venous ultrasound (teaching)",
  shortDescription: "Compression and spectral Doppler survey for DVT — teaching focus on complete vs incomplete compression and flow patterns.",
  readingFramework:
    "Veins are compressed every 1–2 cm; loss of complete coaptation suggests thrombus. Spectral Doppler adds flow phasicity and augmentation checks in teaching protocols.",
  patientJourney: [
    { label: "Presentation", body: "Leg symptoms / risk factors; patient supine with hip externally rotated for femoral access." },
    { label: "Technique", body: "Transverse compression from common femoral through popliteal; calf extension varies by protocol." },
    { label: "Documentation", body: "Representative images + cine of non-compressible segments." },
  ],
  acquisition: {
    name: "B-mode compression + Doppler adjunct",
    description: "No ionizing radiation; highly operator dependent.",
    figures: [{ src: "/journey/ultrasound.jpg", caption: "Venous ultrasound — educational." }],
  },
  imageGuide: {
    src: "/journey/ultrasound.jpg",
    alt: "Venous ultrasound teaching",
    caption: "Conceptual steps in venous US interpretation.",
    hotspots: [
      { xPct: 30, yPct: 45, label: "Common femoral vein", note: "First landmark; thrombus may propagate from iliac segments." },
      { xPct: 52, yPct: 50, label: "Popliteal vein", note: "Calf clot may lodge distally; some protocols add dedicated calf imaging." },
      { xPct: 75, yPct: 48, label: "Augmentation", note: "Distal squeeze should transiently increase spectral signal proximally if vein is patent in teaching checks." },
    ],
  },
  metrics: [
    {
      metric: "Vein compressibility",
      measures: "Binary with B-mode",
      typicalRange: "Full wall coaptation = patent in teaching",
      exampleValue: "Patent (illustrative)",
      deviation: "Non-compressible segment with intraluminal echogenic material → positive study in teaching—urgent clinical notification per policy.",
    },
    {
      metric: "Spectral phasicity",
      measures: "Respiratory variation",
      typicalRange: "Phasic flow toward heart in patent system",
      exampleValue: "Phasic (illustrative)",
      deviation: "Continuous monophasic flow may suggest proximal obstruction or elevated right heart pressures—clinical correlation.",
    },
    {
      metric: "D-dimer (laboratory)",
      measures: "Not part of US machine but paired in pathways",
      typicalRange: "Negative high-sensitivity D-dimer excludes PE/DVT in low pretest probability in validated pathways",
      exampleValue: "—",
      deviation: "Imaging and labs interpreted together—never isolated numbers from this demo.",
    },
    {
      metric: "Study completeness",
      measures: "Coverage to distal calf",
      typicalRange: "Per institutional protocol",
      exampleValue: "Thigh + popliteal only (example)",
      deviation: "Isolated calf DVT may be missed—reports often caveat limited calf evaluation.",
    },
  ],
  nextSteps: [
    "Positive study typically leads to immediate treating-team notification and anticoagulation planning—not patient self-management.",
    "Negative study with high clinical suspicion may warrant repeat US or cross-sectional imaging per pathway.",
    "Critical: phlegmasia or massive iliofemoral clot may trigger emergency multidisciplinary response—clinical presentation drives urgency.",
  ],
  videoCaptions: [
    "Transducer on CFV…",
    "Compression series…",
    "Augmentation maneuver…",
    "Spectral waveform capture…",
    "Structured positive/negative report…",
  ],
};

const MAMMO: Scenario = {
  id: "mg-screening",
  name: "Screening mammography (bilateral)",
  shortDescription: "2D or 3D screening — teaching breast density, masses, and calcification patterns without assigning patient risk numbers.",
  readingFramework:
    "Breast Imaging Reporting and Data System (BI-RADS) categories structure follow-up: assessment 0 incomplete, 1 negative, 2 benign, 3 probably benign short-interval, 4–5 suspicious, 6 known cancer—**educational vocabulary only**.",
  patientJourney: [
    { label: "History", body: "Prior imaging, hormones, implants documented." },
    { label: "CC + MLO", body: "Standard bilateral views; tomosynthesis adds planes through the breast." },
    { label: "Compression", body: "Optimizes dose and reduces motion; patient coaching." },
  ],
  acquisition: {
    name: "Bilateral CC/MLO (± DBT)",
    description: "Low-dose X-ray; DBT reduces tissue overlap in teaching comparisons with 2D alone.",
    figures: [{ src: "/journey/mammography.jpg", caption: "Screening mammogram — educational." }],
  },
  imageGuide: {
    src: "/journey/mammography.jpg",
    alt: "Mammogram teaching",
    caption: "What radiologists annotate on true mammograms (conceptual).",
    hotspots: [
      { xPct: 28, yPct: 42, label: "Parenchymal density", note: "Fatty vs scattered vs heterogeneously dense vs extremely dense—impacts cancer masking and supplemental screening discussions." },
      { xPct: 52, yPct: 48, label: "Mass search", note: "Shape, margin, density; spiculated margins raise suspicion in teaching atlases." },
      { xPct: 72, yPct: 55, label: "Calcifications", note: "Benign pop-corn vs fine pleomorphic branching patterns differ in morphology teaching." },
    ],
  },
  metrics: [
    {
      metric: "BI-RADS density (A–D)",
      measures: "Breast composition",
      typicalRange: "All categories seen in population",
      exampleValue: "C heterogeneously dense (illustrative)",
      deviation: "Higher density lowers sensitivity of mammography alone; supplemental ultrasound/MRI eligibility varies by region and risk models—not computed here.",
    },
    {
      metric: "Assessment category",
      measures: "BI-RADS 0–6",
      typicalRange: "Screening negatives usually 1–2 in teaching",
      exampleValue: "1 negative (illustrative)",
      deviation: "Category 0 needs more imaging; 4–5 triggers biopsy discussion with breast team.",
    },
    {
      metric: "Average glandular dose",
      measures: "Per-view dose estimate",
      typicalRange: "Protocol-dependent",
      exampleValue: "1.5 mGy (illustrative)",
      deviation: "Tracked for QC; does not change lesion interpretation.",
    },
    {
      metric: "Recall rate (population QA)",
      measures: "Screening callback %",
      typicalRange: "Benchmarking programs publish peer ranges",
      exampleValue: "—",
      deviation: "Site-level metric; not interpreted on a single patient study.",
    },
  ],
  nextSteps: [
    "BI-RADS 3 short-interval follow-up vs biopsy is a standardized conversation between radiology and patient services in many centers.",
    "Dense breast notification letters may advise supplemental screening per state law—patient still discusses personal risk with clinician.",
    "Suspicious findings never warrant watchful waiting without clinician involvement—this demo reinforces that pathway only conceptually.",
  ],
  videoCaptions: [
    "Right CC compression…",
    "Right MLO…",
    "Tomosynthesis sweep (if enabled)…",
    "Double read / AI triage if present…",
    "Structured BI-RADS report…",
  ],
};

const MAMMO_DIAG: Scenario = {
  id: "mg-diagnostic",
  name: "Diagnostic mammography (focal complaint)",
  shortDescription: "Spot compression and magnification views for asymmetry or calcifications — teaching how additional views change morphology assessment.",
  readingFramework:
    "Diagnostic workup resolves summation artifact vs true mass, characterizes calcification morphology, and triages biopsy vs stability using additional projections and sometimes ultrasound.",
  patientJourney: [
    { label: "Targeting", body: "Symptom localized; prior outside films imported when possible." },
    { label: "Spot / mag views", body: "Geometric compression isolates region of interest." },
    { label: "US adjunct", body: "Often added for palpable lump or dense tissue in teaching algorithms." },
  ],
  acquisition: {
    name: "Spot compression ± magnification ± targeted US",
    description: "Higher spatial resolution for microcalcifications on magnification in teaching materials.",
    figures: [{ src: "/journey/mammography.jpg", caption: "Diagnostic mammogram — educational." }],
  },
  imageGuide: {
    src: "/journey/mammography.jpg",
    alt: "Diagnostic mammogram teaching",
    caption: "How extra views change interpretation (conceptual).",
    hotspots: [
      { xPct: 40, yPct: 45, label: "Focal asymmetry", note: "May disperse on spot view if summation artifact; persists if true tissue." },
      { xPct: 58, yPct: 52, label: "Microcalc cluster", note: "Magnification clarifies branching vs benign secretory pattern in teaching atlases." },
      { xPct: 72, yPct: 48, label: "US correlate", note: "Hypoechoic mass with angular margins under calcifications supports biopsy pathway in teaching cases." },
    ],
  },
  metrics: [
    {
      metric: "Calcification number on mag",
      measures: "Cluster size / extent",
      typicalRange: "Benign clusters often few and coarse in teaching examples",
      exampleValue: "5 mm cluster (illustrative)",
      deviation: "Increasing pleomorphic microcalcifications widen suspicion—biopsy recommended per BI-RADS lexicon in real practice.",
    },
    {
      metric: "US lesion orientation",
      measures: "Wider than tall vs taller than wide",
      typicalRange: "Benign teaching masses often parallel orientation",
      exampleValue: "Parallel (illustrative)",
      deviation: "Non-parallel orientation raises suspicion—not diagnostic alone.",
    },
    {
      metric: "Elasticity (if shear-wave)",
      measures: "Stiffness map",
      typicalRange: "Vendor-specific scales",
      exampleValue: "—",
      deviation: "Adjunct to B-mode; not universally adopted; interpretation requires training.",
    },
    {
      metric: "Final BI-RADS assessment",
      measures: "Post-workup category",
      typicalRange: "Goal: resolve 0 to 1–3 or escalate 4–5",
      exampleValue: "4A low suspicion (illustrative)",
      deviation: "Drives biopsy vs MRI vs follow-up—multidisciplinary breast conference in many sites.",
    },
  ],
  nextSteps: [
    "Biopsy scheduling, pathology correlation, and patient navigation are handled outside radiology alone—this section is educational.",
    "Benign concordant biopsy returns patient to routine screening in standard teaching pathways.",
    "Discordant imaging-pathology may warrant repeat biopsy or specialist review per tumor board policy—not automated here.",
  ],
  videoCaptions: [
    "Technologist marks area of concern…",
    "Spot compression…",
    "Magnification calcifications…",
    "Radiologist–pathology correlation meeting…",
  ],
};

const PETCT: Scenario = {
  id: "petct-oncology",
  name: "PET/CT oncology staging (FDG)",
  shortDescription: "Whole-body FDG PET/CT — teaching SUV caveats, physiologic uptake, and structured oncologic impression without outcome prediction.",
  readingFramework:
    "Readers scroll fused images noting physiologic uptake (brain, myocardium, renal excretion) and compare focal lesions to liver mediastinum blood pool background in teaching Deauville-style lymphoma response frameworks where applicable.",
  patientJourney: [
    { label: "Prep", body: "Fasting, glucose, hydration; warm room to limit brown fat." },
    { label: "Injection & uptake", body: "Weight-based FDG; quiet uptake period ~60 minutes typical." },
    { label: "Acquisition", body: "Low-dose CT + multi-bed PET; motion management coaching." },
    { label: "Voiding", body: "Reduces bladder streak artifact into pelvis." },
  ],
  acquisition: {
    name: "Low-dose CT attenuation map + PET emission",
    description: "Fusion aligns metabolic signal to anatomy; attenuation correction artifacts are a teaching pitfall near metal and contrast.",
    figures: [{ src: "/journey/pet-ct.jpg", caption: "PET/CT fusion schematic." }],
  },
  imageGuide: {
    src: "/journey/pet-ct.jpg",
    alt: "PET/CT fusion schematic",
    caption: "Hotspots describe what reviewers compare on fused images.",
    hotspots: [
      { xPct: 22, yPct: 50, label: "CT anatomy", note: "Localization of FDG-avid foci to nodes vs organs vs physiologic sites." },
      { xPct: 52, yPct: 50, label: "FDG intensity", note: "Compared to mediastinal blood pool and liver background in teaching response criteria—not a numeric diagnosis here." },
      { xPct: 80, yPct: 50, label: "Physiologic pitfalls", note: "Muscle uptake, brown fat, inflammation, infection mimic malignancy—clinical correlation mandatory." },
    ],
  },
  metrics: [
    {
      metric: "SUVpeak / SUVmax (lesion)",
      measures: "Semi-quantitative uptake normalized to injected dose and lean mass",
      typicalRange: "Highly variable by time post-inject, scanner, reconstruction",
      exampleValue: "SUVmax 6.2 (illustrative)",
      deviation: "Trend vs prior scan matters more than single absolute number; readers document uptake pattern and size together.",
    },
    {
      metric: "Blood glucose pre-scan",
      measures: "mg/dL",
      typicalRange: "Many sites use institutional cutoffs (often near 150–200 mg/dL ranges cited in teaching)",
      exampleValue: "110 mg/dL (illustrative)",
      deviation: "Hyperglycemia degrades lesion-to-background and may delay scan—reschedule vs proceed is site policy.",
    },
    {
      metric: "SUV liver reference",
      measures: "Background for Deauville-style scales in lymphoma teaching",
      typicalRange: "Used comparatively, not as absolute threshold alone",
      exampleValue: "Liver SUVmean ~2.5 (illustrative)",
      deviation: "Helps grade nodal uptake relative to liver and mediastinum in teaching response frameworks.",
    },
    {
      metric: "Uptake time",
      measures: "Minutes injection-to-scan",
      typicalRange: "~60 min FDG oncology protocol",
      exampleValue: "62 min (illustrative)",
      deviation: "Off-protocol timing must be documented because SUV comparability suffers.",
    },
  ],
  nextSteps: [
    "Oncology team integrates PET with histology, prior CT, and treatment timing; SUV alone never starts or stops therapy in teaching curricula.",
    "Inflammatory/infectious uptake may warrant delayed imaging or alternative tracers in research settings—outside prototype scope.",
    "Critical incidental findings (e.g., unexpected large aneurysm) follow institutional incidental finding pathways to treating clinicians.",
  ],
  videoCaptions: [
    "Glucose check…",
    "FDG injection; uptake wait…",
    "CT scout + low-dose CT…",
    "PET bed positions…",
    "Fusion QC at workstation…",
    "Structured oncologic impression…",
  ],
};

const PETCT_RESPONSE: Scenario = {
  id: "petct-response",
  name: "PET/CT interim response (teaching)",
  shortDescription: "Repeat FDG PET/CT during therapy — teaching emphasis on metabolic complete vs partial response using qualitative scales and prior comparison.",
  readingFramework:
    "Readers prioritize lesion-level change versus baseline and note new sites of disease. Semi-quantitative scores (e.g., Deauville 1–5 in lymphoma teaching) summarize nodal uptake relative to mediastinum and liver—not applied to every tumor type.",
  patientJourney: [
    { label: "Consistency", body: "Same scanner or harmonized protocol when possible; uptake time matched to baseline." },
    { label: "Clinical context", body: "Cycle number, intervening steroids, infection—all affect FDG." },
  ],
  acquisition: {
    name: "Same whole-body PET/CT protocol as baseline",
    description: "Side-by-side hanging protocols aid visual comparison in PACS teaching.",
    figures: [{ src: "/journey/pet-ct.jpg", caption: "Fusion schematic." }],
  },
  imageGuide: {
    src: "/journey/pet-ct.jpg",
    alt: "Fusion schematic",
    caption: "Teaching comparison points between time points.",
    hotspots: [
      { xPct: 30, yPct: 48, label: "Baseline avid node", note: "Location ID for follow-up." },
      { xPct: 55, yPct: 48, label: "Current uptake", note: "Residual mediastinal uptake may be inflammatory post-therapy in teaching pitfalls." },
      { xPct: 78, yPct: 50, label: "New focus", note: "Any new FDG-avid site prompts correlation with symptoms and anatomy—progression vs benign inflammation." },
    ],
  },
  metrics: [
    {
      metric: "Deauville score (lymphoma teaching)",
      measures: "1–5 scale vs mediastinum/liver",
      typicalRange: "1–2 often treated as metabolic CR context in teaching Hodgkin protocols",
      exampleValue: "3 (illustrative)",
      deviation: "Score 4–5 suggests PET-positive disease—oncology decides PET-adapted therapy only within trial or guideline context.",
    },
    {
      metric: "TLG / MTV (research metrics)",
      measures: "Total lesion glycolysis / metabolic tumor volume",
      typicalRange: "Used in trials more than community practice in teaching",
      exampleValue: "—",
      deviation: "When reported, trends beat single values; segmentation quality matters.",
    },
    {
      metric: "New organ uptake",
      measures: "Qualitative",
      typicalRange: "None expected if responding",
      exampleValue: "None (illustrative)",
      deviation: "New liver or bowel uptake may be infection, not metastasis—clinical workup first.",
    },
    {
      metric: "SUV change %",
      measures: "Lesion SUVmax vs baseline",
      typicalRange: "No universal % threshold across cancers in teaching",
      exampleValue: "−45% (illustrative)",
      deviation: "Interpreted alongside size on CT component; PERCIST criteria apply only to selected metastatic disease teaching frameworks.",
    },
  ],
  nextSteps: [
    "Tumor board synthesizes PET response with pathology and symptoms; imaging report supplies structured descriptors only.",
    "Pseudo-progression (immune therapy) can increase FDG early—oncology timing rules differ from cytotoxic chemotherapy teaching curves.",
    "Patients should receive result explanations from oncology, not from imaging portals alone when emotionally charged.",
  ],
  videoCaptions: [
    "Prior/current hanging protocol…",
    "Lesion SUV comparison…",
    "Deauville assignment (if lymphoma program)…",
    "Report to oncology EMR…",
  ],
};

const BY_MODALITY: Record<Modality, Scenario[]> = {
  MRI: [MRI_BRAIN, MRI_SPINE],
  CT: [CT_CHEST, CT_PE],
  "X-ray": [XR_CHEST, XR_KNEE],
  Ultrasound: [US_ABDO, US_DVT],
  Mammography: [MAMMO, MAMMO_DIAG],
  "PET/CT": [PETCT, PETCT_RESPONSE],
};

export function getScenariosForModality(m: Modality): Scenario[] {
  return BY_MODALITY[m] ?? [];
}
