# Lovable implementation prompt: “Clinical Machine Journey” (education & procurement readiness)

**Copy everything below this line into Lovable as your build prompt.**  
Adjust product name / URLs if your fork differs.

---

## 0) Critical constraints (read first)

- **Do not modify, remove, or restyle existing features** of the current application (dashboard, explore, compare, devices, ROI, assistant, agents, auth, etc.). This is a **net-new, additive feature** only.
- **Add one new primary navigation entry** in the **left sidebar** (same pattern as other items): label e.g. **“Machine journey”** or **“Learn: install & use”**, linking to a **new route** (e.g. `/journey` or `/learn/machine-journey`).
- The new experience must feel **native** to the app (typography, spacing, panels, dark/light behavior) but **must not refactor** shared layout code unless required to insert the nav item with minimal diff.
- All content is **educational and planning-oriented**, not clinical decision support. Include a persistent footer disclaimer: *not medical advice; site workflows vary by institution, OEM, and jurisdiction; always follow local regulation, OEM IFU, and qualified professionals (physicists, radiologists, engineers, MR safety experts).* 

---

## 1) Product intent

Build a **guided learning experience** for a stakeholder who may **buy, site-plan, or operate** advanced medical imaging equipment but lacks end-to-end experience. The user **selects a machine** (from the app’s existing device catalog or a simplified picker seeded from the same data). They then explore:

1. **How to set it up** — facility, environment, safety, installation, integration, acceptance, go-live.  
2. **How to use it** — patient/workflow, technologist operations, safety screening, exam steps, handoffs to reporting.  
3. **What surrounds the machine** — **hardware**, **software**, and **ecosystem** (IT, standards, data flow, quality, governance).

The UX should mimic a **structured course**: chapters → lessons → checkpoints (short knowledge checks) → recap. Allow **saving progress locally** (e.g. `localStorage`) so returning users resume.

---

## 2) Audience & tone

- **Primary:** department admin, new technologist, IT/integration lead, procurement, or clinical lead learning the full picture.  
- **Tone:** clear, respectful, non-jargony; define acronyms on first use; optional “deep dive” accordions for experts.  
- **Avoid:** pretending to replace OEM manuals, physicist sign-off, or institutional policy.

---

## 3) Information architecture

### 3.1 Top-level structure (after machine selection)

Use **tabs** or **left sub-nav** inside the journey page:

| Section | Purpose |
|--------|---------|
| **Overview** | What this modality does, roles involved (vendor, physicist, rad, tech, IT, facilities), timeline from contract to first patient. |
| **Setup flow** | Site planning → delivery → install → integration → acceptance/QC → training → go-live. |
| **Use flow** | Order/scheduling → patient identity & consent → screening & prep → acquisition → post-processing → storage → reporting → archival. |
| **Elements map** | Interactive map or checklist: **Hardware**, **Software**, **Ecosystem & standards** (see §5). |
| **Glossary** | Searchable terms (DICOM, PACS, MWL, HL7, FHIR, SNR, ghosting, etc.). |
| **Resources** | Links to public references (ACR, AAPM, IHE, DICOM standard hub, OEM-agnostic primers). |

### 3.2 Progress model

- Per machine: `% complete`, last visited lesson, bookmarks.  
- **Checkpoints**: 3–6 questions per major chapter (multiple choice + “select all that apply”). Non-punitive: show rationale with citations to glossary sections.

---

## 4) Machine selection

- Reuse the app’s **device list** (name, vendor, modality, thumbnail if any).  
- On select, **pre-bind modality-specific curriculum** (MRI vs CT vs X-ray vs US vs mammo vs PET/CT).  
- Show a **“journey duration”** estimate (e.g. 25–40 min read + interactions).

---

## 5) “Elements surrounding the machine” (hardware, software, ecosystem)

Present as a **visual grid** or **layered diagram** (modal → workstation → network → data center / cloud). Each tile expands into a lesson stub.

### 5.1 Hardware (examples — tailor by modality)

- **Gantry / magnet / tube / detector / transducer / collimator** (as applicable)  
- **Patient table / couch**, **injector** (CT/MR/PET), **coils** (MR), **anti-scatter grids** (DR), **generator** (XR)  
- **Power**, **UPS**, **cooling/chillers** (MR/CT), **RF chain** (MR)  
- **Viewing stations**, **barcode scanners**, **voice comm** between control and exam room  

### 5.2 Software (examples)

- **Acquisition console software**, **exam protocols**, **reconstruction** (iterative vs filtered back-projection for CT, etc.)  
- **Vendor advanced apps** (perfusion, spectroscopy—only as “exists, OEM-specific”)  
- **PACS viewer**, **3D/advanced visualization** (where used)  
- **RIS/HIS integration clients**, **worklist** UI on modality  

### 5.3 Ecosystem, standards, APIs, data movement

Educate on **how data moves**, not vendor-specific proprietary APIs only:

- **DICOM**: objects (e.g. CT/MR/US images, SR, GSPS), **tags/metadata**, **UIDs**, **SOP Class UIDs** at a conceptual level. Explain **DICOMweb (WADO/QIDO/STOW)** as modern web retrieval.  
- **PACS**: archive, lifecycle, prefetching, routing, VNA conceptually.  
- **RIS / EHR**: orders, accession, report status.  
- **HL7 v2** (ORM/ORU at high level) and **FHIR** (`ImagingStudy`, `DiagnosticReport`) as **modern interoperability** patterns.  
- **DICOM Modality Worklist (MWL)** — why it reduces manual entry errors.  
- **IHE profiles** (mention **Scheduled Workflow** as the idea: predictable interoperability testing).  
- **Audit / security**: TLS, role-based access, PHI boundaries, backup & DR at a conceptual level.

### 5.4 Quality, physics, and governance ( modality-specific depth)

Include a subsection **“Image quality & QC”** with **plain-language** explanations and **example metrics** where appropriate:

- **MRI:** SNR, spatial resolution, artifacts (motion, aliasing, susceptibility), **parallel imaging** tradeoffs, **SAR** concept (safety + limits at high level).  
- **CT:** dose indices conceptually (**CTDIvol**, **DLP** as education—no patient-specific dosing), noise, resolution, artifact awareness.  
- **XR/DR:** exposure indicators, grid use, positioning impact.  
- **US:** gain, TGC, frame rate, Doppler basics.  
- **Mammography:** compression rationale, **QC phantoms** at high level.  
- **PET/CT:** uptake timing, motion, alignment PET/CT.

Relate **acceptance testing** vs **routine QC** vs **periodic physicist review** (educational framing consistent with common medical physics practice).

---

## 6) Setup flow curriculum (what to teach)

Use **ordered steps** with expandable detail. Not every site matches—always say “OEM-specific”.

**Suggested chapters:**

1. **Procurement & stakeholders** — budget, service contract, applications training, physics contract, IT security review.  
2. **Regulatory & institutional** — local licensing/notifications (region-dependent placeholder text), radiation safety committee (for ionizing modalities), **MR safety program** (for MRI: zones, screening policies—high level, defer to MR Safety Expert).  
3. **Site planning & facilities**  
   - **MRI (emphasize):** RF shielded enclosure, **5-gauss line** containment concept, **quench pipe**, cryogen access, HVAC tolerance, floor load/vibration, restricted ferromagnetic policies.  
   - **CT:** shielding calculations (conceptual), power, HVAC, floor specs.  
   - **XR:** room shielding, scatter awareness, interlocks.  
   - **US:** room size, ergonomics, gel/waste (institutional).  
4. **Delivery & installation** — rigging path, dock, vibration during magnet delivery (MR).  
5. **Electrical & mechanical** — isolated power where relevant, UPS expectations (high level).  
6. **IT network** — VLAN segmentation, time sync (NTP), integration test ports, monitoring.  
7. **Integration** — HL7 feeds, DICOM destinations, worklist, **DICOM conformance statement** reading (what it is).  
8. **Acceptance & commissioning** — vendor specs vs contract, **acceptance testing** with phantoms, baseline image quality.  
9. **Training & go-live** — super-user model, protocol freeze vs optimization, first-week support.  
10. **Post-go-live** — QC cadence, service tickets, upgrade paths.

---

## 7) Use flow curriculum (what to teach)

**Suggested chapters:**

1. **Scheduling & orders** — indication, contrast allergies (if relevant), fasting rules (modality/protocol dependent placeholders).  
2. **Patient identification & consent** — institutional policy framing.  
3. **Screening** — **MRI safety screening** (devices, implants, foreign bodies) vs **pregnancy/radiation** screening for ionizing modalities.  
4. **Preparation** — clothing, IV access, hydration, motion management, breath-hold coaching.  
5. **Room setup** — coils (MR), landmarks, radiation protection (XR/CT/PET).  
6. **Acquisition** — protocol choice, positioning, monitoring.  
7. **Post-processing** — MPR, MIP (CT), sequences reformats (MR)—conceptual.  
8. **Results routing** — images to PACS, flags for critical results (institutional), report workflow.

Each chapter: **1–2 scenario cards** (“What can go wrong?” / “What does IT need?”) to keep it practical.

---

## 8) Media & imagery requirements (must-have)

Use **images and diagrams** generously. Prefer **licensed or public domain** assets; attribute in UI.

### 8.1 Required visual types

- **DICOM concept art:** screenshot-style diagram of **metadata tags** alongside a thumbnail image; explain header vs pixel data.  
- **Sample clinical-style images** (clearly labeled **synthetic / educational / public dataset**):  
  - **Chest X-ray**  
  - **CT axial slice** (lung window example)  
  - **MR brain** (T1/T2 style—labeled generically)  
  - **US** still/frame diagram  
  - **Mammography** schematic + example patch (tasteful, educational)  
  - **PET/CT fusion** concept diagram  

### 8.2 Suggested sources (implementer should verify license)

- **NIH Chest X-ray** or similar open datasets (cite).  
- **TCIA (The Cancer Imaging Archive)** — use only with proper **attribution** and **usage notes**.  
- **Wikimedia Commons** medical images with CC licenses.  
- For **DICOM file structure**, consider a **hand-drawn schematic** or **vendor-neutral diagram** generated for the app (safest legally).

### 8.3 UX for images

- Lightbox/zoom, short caption, “what to notice” callouts.  
- For **DICOM**, show a **fake tag table** (PatientID anonymized, StudyUID, SeriesDescription, KVP for CT, etc.)—**do not** use real PHI.

---

## 9) Interactivity patterns (Lovable-friendly)

- **Flowchart** for Setup vs Use (clickable nodes).  
- **Toggle:** “Hospital outpatient” vs “Imaging center” differences (short).  
- **Checklists** (printable optional) for site walkthrough.  
- **Quiz** with explanations.  
- **“Ask what changes if…”** scenarios (e.g., “mobile MR unit” stub section).

---

## 10) Modality coverage matrix (minimum content)

For **each** modality supported in the catalog, provide **at least**:

- 8 setup lessons (can share a common spine + 3 modality-specific lessons).  
- 8 use-flow lessons (common spine + 3 modality-specific).  
- 12 ecosystem element tiles (shared + specific).  

**MRI-specific must include:** MR safety zones, screening, SAR concept, shielding/quench pipe mention, coil types list (body/head/surface—high level).  
**CT-specific must include:** dose awareness education, shielding, contrast workflow mention.  
**Ionizing XR** must include:** ALARA concept, collimation, technique factors.  
**US:** no ionizing, but probe hygiene, bioeffects at high level.  
**Mammo:** compression, QC culture.  
**PET/CT:** radiation + uptake workflow.

---

## 11) Non-functional requirements

- **Performance:** lazy-load heavy images; route code-split.  
- **Accessibility:** keyboard nav, alt text, sufficient contrast.  
- **Internationalization-ready** copy (even if English-only v1).  
- **Analytics hooks** optional (page views only).

---

## 12) Acceptance criteria (definition of done)

- New **sidebar item** visible on all main layouts where other items appear.  
- `/journey` (or chosen path) works; **machine picker** persists selection.  
- **Three major areas** clearly available: **Setup**, **Use**, **Elements**.  
- **Checkpoints** function with explanatory feedback.  
- **≥10 educational images/diagrams** total across modalities (mix of real public-domain and app-generated diagrams).  
- **Glossary** ≥ 40 terms with cross-links from lessons.  
- **No regressions** to existing routes.

---

## 13) Reference notes for researchers (background reading — not user-visible wall of text)

Use these themes when writing copy:

- **Interoperability:** DICOM, DICOMweb, HL7 ORM/ORU, FHIR imaging resources, MWL, IHE Scheduled Workflow.  
- **Installation:** stakeholder coordination (physics, IT, vendor), acceptance testing baselines, follow-up optimization visits.  
- **MRI siting:** RF shield, 5-gauss planning, quench vent path, cryogen access, environmental specs (OEM-driven).  
- **QC culture:** acceptance vs routine QC vs periodic physicist review.

---

## 14) Handoff to your codebase (if merging Lovable output later)

- Keep new pages under e.g. `src/routes/journey.tsx` + small components in `src/components/journey/`.  
- Add the route to the router registry **without** renaming existing routes.  
- Sidebar: add **one object** to the existing nav config array.

---

**End of Lovable prompt.**
