# MedIntel Atlas — prototype feature build prompt (frontend-only)

**Copy everything below the line into your AI builder (e.g. Gamma for narrative only; Lovable/Cursor for code).**

**Hard scope — read first**

- This is a **prototype / demo**: **no real backend**, **no database**, **no auth server**, **no PHI**, **no production compliance claims**.
- Implement with **static JSON / TypeScript fixtures**, **localStorage where helpful**, and **simulated latency** (e.g. `setTimeout` 400–1200ms) so flows feel alive.
- All “agents” are **UI simulations**: canned steps, staged logs, deterministic or lightly randomized outcomes — **not** real crawlers, ML models, or document parsers unless you stub them with fake responses.
- **Medical / surgical / fatality content**: do **not** ship as clinical decision support. Any scenario copy must be framed as **educational illustration**, with **persistent disclaimers** (“not medical advice; not for patient care; verify with qualified clinicians and OEM IFU”).
- Do **not** promise real “hospitals that bought this SKU” unless data is clearly **synthetic** (“illustrative placements”) or attributed to a **public mock dataset** you invent for the demo.

---

## 0) Tech assumptions (existing stack)

- Stay inside the current **TanStack Start + React + Vite** app.
- Prefer **additive routes and components**; avoid unrelated refactors.
- Reuse existing **AppShell**, **theme**, **device catalog** (`DEVICES`, `getDevice`), and **Machine Journey** area where specified.

---

## 1) Device detail — new tabs: Reviews & hospital placements

**Where:** `devices.$deviceId` (or equivalent device detail route).

**Add two sub-tabs or accordions** (alongside existing content):

### 1a) Reviews (prototype)

- Show **3–8 review cards** per device from a **fixture file** keyed by `deviceId`.
- Each card: **rating (1–5)**, **title**, **short body**, **reviewer role** (e.g. “Chief Tech, anonymized site”), **date** (synthetic), optional **tags** (image quality, service, training).
- **“Write a review”** opens a **modal** that accepts text and stores in **localStorage** only (append to a list for that device in this browser). No server.

### 1b) Hospitals / sites (prototype — “by country”)

- **Comprehensive-looking** but **fake data**: table or **sortable grid** + **map-style visual** (static SVG world map with dots, or grouped list by country).
- Columns: **Country**, **City (optional)**, **Site type** (public / private / academic), **Modality context**, **Year (illustrative)**, **Source** = “Demo dataset”.
- Filters: country, site type, year range (client-side only).
- Tooltip or drawer: one paragraph of **synthetic** context (“typical procurement path in this region” — clearly generic).

**UX:** dense but readable; use **sticky header**, **zebra rows**, **empty state** if no fixtures for a device (generate 5–10 generic rows from a template + device name).

---

## 2) Machine Journey / study — scenario dropdown & breakdown

**Where:** existing **Machine Journey** flow for a selected device (`/journey/$deviceId` or as you have it).

**Add:** a **Scenario** dropdown at the top of the journey view (or a dedicated sub-tab **“Scenarios”**).

**Data:** `scenariosByModality` or `scenariosByDeviceId` in fixtures. Each scenario includes:

| Section | Prototype content |
|--------|-------------------|
| **Patient journey** | Plain-language steps: arrival, consent, screening, prep, **positioning** (supine/prone, head angle, arms, immobilization), **room conditions** (lights dimmed / breath coaching — generic, modality-aware), **typical duration range** (“illustrative 15–45 min” — never present as guarantee). |
| **What gets acquired** | Name of sequence/projection; **1–2 placeholder images** (stock or bundled schematic — no real patient DICOM). |
| **Image / data guide** | **Educational only**: label regions on an **annotated overlay** (SVG hotspots) — “this region corresponds to X in general teaching materials,” **not** “this means cancer.” |
| **Metrics table** | Columns: **Metric**, **What it measures**, **Typical range (illustrative)**, **Example value (synthetic)**, **How to think about deviation** — always “discuss with radiology / refer to protocol,” **no** diagnosis. |
| **Next steps (generic)** | Bullet list: “correlation with clinical history,” “additional imaging,” “referral pathways” — **no** surgery urgency numbers, **no** fatality percentages in v1 (too CDS-like). If you must mention urgency, use **ordinal tiers only** (“routine / soon / emergent — institutional definitions vary”) with disclaimer. |
| **Video** | **Optional:** embedded **public-domain or licensed** clip URL **or** a **“Simulated clip”** card with poster image + “Play” that shows a **modal with 10s placeholder animation** (progress bar + captions) if no real video — label clearly as demo. |

**UX:** selecting a scenario **scrolls** to an anchor or uses **vertical stepper** with expand/collapse. Print-friendly optional CSS.

---

## 3) Login — Sign up (prototype profile creation)

**Where:** `login` route (or auth gate).

**Add:** **“Create account” / “Sign up”** secondary action.

**Flow (wizard, 2–3 steps, all client-side):**

1. **Identity:** name, email (no verification), password (store **never** in plain text in localStorage — for prototype either **omit persistence** and keep in session state only, or **don’t persist password at all** and mock “account created”).
2. **Role:** enum — **Student**, **Healthcare Professional**, **Healthcare Expert (content)**, **Business / stakeholder**.
3. **Profile:** gender (optional), years of experience (optional), **specialization** (free text or chips), **credentials** (text area — “not verified in demo”).
4. **Completion:** success screen + **role badge** shown in header (read from **sessionStorage** / in-memory context).

**RBAC simulation (frontend only):**

- **Expert** sees extra UI: “**Pending content**” badge, ability to open **Intel Expert** agent (below).
- Others see read-only or reduced actions. Enforce with a tiny **permission map** in code, not security.

**Disclaimer:** “Demo accounts are not secured; do not enter real credentials.”

---

## 4) Agents screen — replace current list with three simulated agents

**Where:** `/agents` (replace existing static agent cards).

**Global pattern for each agent:**

- **Header:** name, purpose, status pill (**Idle / Running / Needs review**).
- **Job panel:** upload URL fields OR file picker (**accept but do not actually scan** binary in browser unless you use a safe client-only parser for **public sample PDFs only**).
- **Activity log:** append lines with timestamps (“Queued”, “Sanitizing…”, “Extracting sections…”, “Validating against catalog…”) — **canned script** advancing on button **Start** or timer.
- **Output panel:** markdown summary + **confidence bar** (fake) + **sources list** (synthetic URLs).
- **Reset** clears run state.

### Agent A — Document / video ingest (simulated)

- Inputs: **file** (name + size only) **or** URL string.
- Steps: “sanitize” → “simulate transcript/OCR” → show **2–3 bullet takeaways** from fixture keyed by filename pattern or random.
- If URL: validate format; on “failure” show graceful error.

### Agent B — Intel Expert (human-in-the-loop simulation)

- Side-by-side: **current device fact** (from catalog) vs **“proposed edit”** text area.
- Buttons: **Accept**, **Reject**, **Save draft** (localStorage per device).
- **Version history** (prototype): simple **array in localStorage** `{ id, ts, authorLabel, diffSummary }` with max 10 entries; timeline UI.

### Agent C — Public web scout (simulated)

- Input: device name + region (optional).
- Output: **“Competitor set”** table (3–5 rows) from fixture: competitor product, vendor, **claimed differentiator** (generic), **last “seen” date** (synthetic).
- Log line: “Fetched from simulated public sources.”

**Quality bar:** animations subtle; logs readable; no instant snap from idle to done — use **multi-step** progress.

---

## 5) Data & legal posture (copy-paste for UI)

- Footer on sensitive views: **Educational / procurement planning prototype. Not for clinical use. Not FDA-cleared as a medical device. Illustrative data only unless explicitly sourced.**
- Hospital list: label **“Illustrative placements (demo)”**.
- Scenarios: **“Teaching scenario — not patient-specific.”**

---

## 6) Acceptance criteria (prototype)

- [ ] Device page: **Reviews** + **Hospitals by country** sections populated from fixtures; optional user review to localStorage.
- [ ] Journey: **Scenario** selector with **full breakdown layout** + disclaimers + at least **one annotated figure** per scenario family.
- [ ] Login: **Sign up** wizard + role badge; **Expert** unlocks expert UI paths.
- [ ] Agents: **three** simulated agents with **credible multi-step runs** and **reset**; old agent list removed or archived.
- [ ] **No backend** calls required for demo; optional `fetch` to **public** JSON in `/public` is OK if static-hosted.
- [ ] `npm run build` passes.

---

## 7) Suggested file layout (non-binding)

- `src/lib/fixtures/reviews.ts`, `hospitalPlacements.ts`, `scenarios.ts`, `competitors.ts`
- `src/components/agents/*` — one component per agent + shared `SimulatedRunPanel`
- `src/routes/signup.tsx` or wizard inside `login.tsx`
- Extend `devices.$deviceId.tsx` and journey route only as needed

---

**End of prototype prompt.**
