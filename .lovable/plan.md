## Machine Journey — Guided Learning Experience (additive)

A net-new, additive learning module for MedIntel Atlas. No existing route, layout, or feature is modified beyond inserting a single nav entry.

### Scope guardrails
- Add exactly one item to `NAV` in `src/components/atlas/AppShell.tsx` (`/journey`, label "Machine Journey", icon `GraduationCap`). No other AppShell changes.
- All new code under `src/routes/journey.tsx`, `src/routes/journey.$deviceId.tsx`, and `src/components/journey/*` + `src/lib/journey/*`.
- Reuse existing tokens (`glass-panel`, `--color-*`), Tabs, Accordion, Progress, Badge, etc. No restyle of shared primitives.
- Persistent footer disclaimer on every journey screen.

### Routes
1. `/journey` — Machine picker
   - Reuses `DEVICES` from `src/lib/atlas/data.ts` with modality filter chips (MRI / CT / X-ray / US / Mammo / PET-CT).
   - Resume card if `localStorage` has prior progress.
   - "Estimated 25–40 min" badge + curriculum preview per modality.
2. `/journey/$deviceId` — Course shell
   - Header: device name, vendor, modality, overall progress bar, bookmark, reset.
   - Vertical sub-nav (matches device-detail vertical-tabs pattern): **Overview · Setup Flow · Use Flow · Elements Map · Glossary · Resources**.
   - Each section renders chapter list → lessons (accordion) → checkpoint quiz at end.

### Data model (`src/lib/journey/curriculum.ts`)
```
Curriculum = {
  modality, overview, setup: Chapter[], use: Chapter[],
  elements: { hardware: Tile[]; software: Tile[]; ecosystem: Tile[] },
  glossary: Term[], resources: Resource[]
}
Chapter = { id, title, summary, lessons: Lesson[], checkpoint: Quiz }
Lesson  = { id, title, body (MDX-ish blocks: paragraph | callout | image | list | tagTable | flowNode), deepDive? }
Quiz    = { questions: { q, type: 'single'|'multi', options, correct[], rationale }[] }
```
- Shared "spine" curriculum + per-modality overlays (MRI gets RF shielding/5-gauss/SAR/coils; CT gets CTDIvol/DLP/contrast; XR ALARA; US probe hygiene; Mammo compression/QC; PET/CT uptake/fusion).
- Glossary ≥40 terms (DICOM, PACS, RIS, HL7 v2, FHIR ImagingStudy, MWL, DICOMweb WADO/QIDO/STOW, VNA, IHE SWF, SNR, SAR, CTDIvol, DLP, ALARA, MIP, MPR, etc.) with cross-link tokens `[[term]]` rendered as hover popovers.

### Progress (`src/lib/journey/progress.ts`)
- `localStorage` key `medintel.journey.v1` → `{ [deviceId]: { completedLessons: string[], quizScores: {chapterId:%}, lastLessonId, bookmarks[] } }`.
- Hook `useJourneyProgress(deviceId)` exposing `markComplete`, `setLast`, `toggleBookmark`, `pct`.

### Components (`src/components/journey/`)
- `MachinePicker.tsx` — modality filter + device grid (light wrapper around existing card style).
- `CourseShell.tsx` — vertical sub-nav + progress header + footer disclaimer.
- `ChapterList.tsx`, `LessonAccordion.tsx`, `LessonRenderer.tsx` (renders block types).
- `Checkpoint.tsx` — quiz with non-punitive feedback + rationale + glossary cross-links.
- `ElementsMap.tsx` — layered diagram (CSS grid: Modality → Workstation → Network → Archive/Cloud); each tile opens a Sheet with the lesson stub.
- `FlowDiagram.tsx` — clickable horizontal flow for Setup (Procurement → Regulatory → Site Plan → Delivery → Install → Integration → Acceptance → Training → Go-live → Post-go-live) and Use (Order → ID/Consent → Screening → Prep → Acquisition → Post-proc → PACS → Report).
- `Glossary.tsx` — searchable list + anchor links.
- `DicomTagTable.tsx` — synthetic, anonymized tag table illustration.
- `JourneyDisclaimer.tsx` — sticky footer banner.

### Imagery (≥10 assets)
- 6 generated SVG/PNG diagrams under `src/assets/journey/` (DICOM header schematic, layered ecosystem diagram, MR safety zones I–IV, CT dose concept, PET/CT fusion concept, US transducer/TGC). Generated via `imagegen--generate_image` (fast tier) — synthetic, clearly labeled "Educational diagram".
- 4 public-domain clinical-style examples sourced via curated URLs from Wikimedia Commons (Chest XR, CT axial lung-window, MR brain T1, US still). Stored as remote `<img>` with caption + attribution; `loading="lazy"`.

### Modality coverage matrix
For each of 6 modalities: shared spine (5 setup + 5 use chapters) + 3 modality-specific setup + 3 modality-specific use + 12 element tiles. Hits the "≥8 setup, ≥8 use, ≥12 elements" bar.

### Non-functional
- Route is code-split (own file). Heavy lesson content lives in `src/lib/journey/content/{modality}.ts` lazy-imported per device.
- All interactive elements keyboard-accessible; alt text on every image; respects existing dark/light theme tokens.

### Demo flow (added to README)
Sidebar → Machine Journey → pick a Siemens MAGNETOM → Setup Flow → expand "Site Planning" → view 5-gauss diagram → take checkpoint → Elements Map → click "DICOM MWL" tile → Glossary cross-link.

### Out of scope
- No edits to existing routes, data files, store, or theme.
- No backend, no real PHI, no OEM-specific procedures.
