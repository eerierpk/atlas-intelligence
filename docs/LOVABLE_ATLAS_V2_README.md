# MedIntel Atlas — Lovable build prompt (v2)

**Copy everything below the line into Lovable (or your AI builder).** This README is the single source for the v2 scope: admin & users, searchable controls, responsive layout, and chat-first agents.

---

## MedIntel Atlas — Lovable build prompt (v2: Admin, profiles, searchable UI, responsive, agent chat)

### 0) Product context (read first)

- This is a **prototype / demo** for **capital equipment intelligence** (MRI, CT, etc.): **no real PHI**, **no clinical decision support claims**, **no verified competitive intelligence** unless clearly labeled simulated.
- Stack: keep current **React + Vite** patterns; preserve **app shell**, **theme tokens**, and **device catalog** unless refactor is required for features below.
- **Accessibility:** keyboard-first comboboxes, visible **focus-visible** rings, `aria-*` on listboxes, sufficient contrast (WCAG-oriented).

---

### 1) Global UI rules (applies to every page — existing + future)

#### 1a) Searchable dropdowns (mandatory)

- **Every dropdown** the app uses for choosing from a list (role, device, region, gender, specialization picker, agent switcher lists, filters on explore/compare, etc.) must be implemented as a **searchable combobox**, not a plain native `<select>` **except** where the platform forces native behavior (e.g. rare mobile edge cases—and if so, document why).
- **Pattern:** type-to-filter, arrow-key navigation, Enter to select, Esc to close, click-outside to close, optional clear button, empty state (“No matches”).
- **Libraries (pick one and use consistently):** e.g. **cmdk**, **Downshift**, **React Aria ComboBox**, or **Headless UI Combobox**.
- **Short lists (e.g. 3 genders):** still use the same combobox component so behavior and styling stay consistent; search simply filters the three options.

#### 1b) Responsive design (mandatory — all routes)

- **Scope:** **Every route and layout** that exists today **and any route added later** must be **responsive** and visually polished on **phone (320–480px)**, **tablet (481–1024px)**, and **desktop (1025px+)**.
- **Navigation:** On small screens, primary nav collapses into a **hamburger / drawer** or bottom nav; no horizontal overflow of nav items.
- **Tables:** Use **horizontal scroll** with **sticky first column** where needed, or **card list** layout on mobile instead of wide tables.
- **Panels / modals:** Full-screen or near full-screen on phone; max-width centered modals on desktop.
- **Ask AI / agent panel:** On phone, **full-height sheet**; on tablet, **resizable drawer** or wide drawer; on desktop, **side dock** — must not obscure critical actions without a way to dismiss.
- **Touch targets:** Minimum **44×44px** interactive targets on touch breakpoints.
- **Typography & spacing:** Scale down padding and font sizes slightly on small screens; avoid cramped multi-column grids on phone (stack to **single column** by default).
- **Testing expectation:** Lovable / dev should verify **at least** key pages: login, dashboard, explore, device detail, compare, journey, ROI, agents (or agent panel), saved workspace, admin — at **375px**, **768px**, and **1280px** widths.

---

### 2) Admin: user creation & management

**New route/area:** `/admin` (or `/settings/admin`) visible only to **`Admin`** role (add `Admin` to role enum if missing; seed one admin user in demo).

**Features**

- **User list** table: name, email, role, status (active/disabled), last login (mock), created date, specialization tags (chips), gender.
- **Create user** form (modal or page):
  - **Full name** (required)
  - **Work email** (required, validate format)
  - **Role** (required): align with app roles, e.g. `Student` | `Healthcare Professional` | `Healthcare Expert` | `Business / Stakeholder` | **`Admin`** (adjust to match codebase).
  - **Gender** (required): **searchable combobox** with **exactly** these options: `Male` | `Female` | `Do not want to specify`.
  - **Specialization** (optional): **multi-select tags** from **Appendix A** in this README (search-as-you-type combobox; selected items as removable chips).
  - Optional: job title, department, phone (demo-only).
- **Edit user** / **Deactivate user** (soft delete) / **Reset access** (mock).
- **Credentials email (simulated):** On successful create, show a **modal** “Email queued” with **copyable** temporary password or magic link **placeholder**; optional **demo outbox** table (last N). Label **“Simulated email — prototype”**. Do **not** claim real SMTP unless wired.

**Security (prototype)**

- Do not store plaintext passwords in `localStorage`; mock server or ephemeral display only.

---

### 3) Auth: move signup off public login

- **Login page:** **Remove** self-service **signup wizard** from `/login`. Login = **email + password** (and any SSO mock).
- **Admin-only provisioning:** New accounts are created from **§2 Admin** only.
- Optional: **“Request access”** stub that does not create accounts without admin.

---

### 4) CSS / visual polish (global)

- Consistent **spacing scale**, **typography hierarchy** (labels, helper text, body), **panel elevation**, **focus-visible**, **empty states**, **skeleton loaders** for async.
- **Responsive grids:** default **1 column** on `xs/sm`; **2 columns** on `md`; **3–4 columns** on `lg/xl` only where content allows.
- **Subtle motion (150–250ms)** on panel transitions and agent switch (see §6).

---

### 5) Profile model

Align user profile with admin create: `name`, `email`, `role`, `gender` (enum above), `specializations: string[]` (from Appendix A), optional `title`, `credentials`, `yearsExperience`.

---

### 6) Agents: chat-first UX + Ask AI panel

**Goal:** Agents feel like **modern assistant UIs** (ChatGPT / Cursor-style): **thread**, **distinct user/assistant bubbles**, **structured output** below assistant messages.

**Information architecture**

- **Ask AI panel** includes an **agent switcher** (searchable combobox or prominent segmented control):
  - **`Ask Atlas`** — base Q&A, navigation help, catalog questions.
  - **`Intel Expert`** — human-in-the-loop catalog edits (if applicable).
  - **`Document / video ingest`** — upload + URL + simulated pipeline.
  - **`Public web scout`** — device + region + simulated competitor run.
- **Standalone `/agents` page:** either remove and deep-link into panel, or keep as **launcher** that opens the panel on the correct agent.

**Agent switch UX**

- Clear **visual change** on switch (banner + short description + optional thread slide/fade).
- **Separate thread state per agent** (preferred) or explicit “Clear chat?” when switching — pick one and show in UI.

**Per-agent chat (required)**

- **Collapsible “How this agent works”** at top: inputs, guardrails, simulated latency.
- **User messages:** show **input summary chips** (device, region, filename, etc.) when relevant.
- **Assistant messages:** structured sections — **Summary** · **Key bullets** · **Tables/cards** · **Sources (simulated)** · **Confidence** · **Next steps**.
- **Composer:** keep **upload / URL / device** as **toolbar attachments**; primary surface is the **message thread**.

---

### 7) Data & disclaimers

- Agents remain **simulated**; label illustrative outputs.
- Specialization tags are **self-identified context** for UX only — not credential verification.

---

### 8) Engineering notes

- Prefer **additive routes** and **refactoring the Ask AI panel** over a full rewrite.
- Gate `/admin` with **Admin** role (or equivalent permission).
- Comment **feature flags** for “real email / real backend later.”

---

### 9) Acceptance checklist

- [ ] **All** list-pickers use **searchable combobox** (including gender and role).
- [ ] **All** current and new routes: usable and visually sound at **~375px**, **~768px**, **~1280px** (no broken nav, no clipped critical CTAs, tables handled).
- [ ] Admin CRUD users; role + gender + multi specialization from Appendix A.
- [ ] Login has **no** public signup; admin provisions users.
- [ ] Simulated **email credentials** UX with clear prototype labeling.
- [ ] Ask AI panel: **agent switch** + **chat layout** + **structured outputs**; uploads in composer.

---

## Appendix A — Specialization multi-select tags (canonical list)

**Implementation:** store **exact string** matches; combobox searches label text (and optional aliases).

### A) Physician — broad specialties (ABMS-style)

Allergy and Immunology  
Anesthesiology  
Colon and Rectal Surgery  
Dermatology  
Emergency Medicine  
Family Medicine  
Internal Medicine  
Medical Genetics and Genomics  
Neurological Surgery  
Nuclear Medicine  
Obstetrics and Gynecology  
Ophthalmology  
Orthopaedic Surgery  
Otolaryngology – Head and Neck Surgery  
Pathology  
Pediatrics  
Physical Medicine and Rehabilitation  
Plastic Surgery  
Preventive Medicine  
Psychiatry and Neurology  
Radiology  
Surgery (General Surgery)  
Thoracic Surgery  
Urology  
Vascular Surgery  

### B) Common subspecialties (frequently used)

Adult Congenital Heart Disease  
Advanced Heart Failure and Transplant Cardiology  
Cardiovascular Disease  
Clinical Cardiac Electrophysiology  
Interventional Cardiology  
Gastroenterology  
Transplant Hepatology  
Nephrology  
Pulmonary Disease  
Critical Care Medicine  
Infectious Disease  
Rheumatology  
Endocrinology, Diabetes and Metabolism  
Geriatric Medicine  
Hematology  
Medical Oncology  
Sleep Medicine  
Pain Medicine  
Sports Medicine  
Hospice and Palliative Medicine  
Neurocritical Care  
Medical Toxicology  
Gynecologic Oncology  
Maternal–Fetal Medicine  
Reproductive Endocrinology and Infertility  
Orthopaedic Sports Medicine  
Hand Surgery  
Plastic Surgery Within the Head and Neck  
Neurotology  
Interventional Radiology  
Diagnostic Radiology  
Radiation Oncology  
Neurology  
Child and Adolescent Psychiatry  
Addiction Psychiatry  
Geriatric Psychiatry  

### C) Allied health, imaging sciences, and capital-planning adjacent

Diagnostic Medical Physicist  
Medical Physicist (Therapy)  
Radiation Therapist  
Radiologic Technologist / Radiographer  
MRI Technologist  
CT Technologist  
Ultrasound Sonographer  
Nuclear Medicine Technologist  
Cardiovascular Technologist  
Biomedical / Clinical Engineer  
Clinical Informatics  
Health Information Management  
Perioperative Services Leadership  
Imaging Services Director / Manager  
Materials Management / Supply Chain  
Value Analysis  
Capital Planning / Finance  
IT / Cybersecurity (Healthcare)  
Procurement / Sourcing  
Quality / Patient Safety  
Research Operations  

**Attribution note (for your internal README):** Physician taxonomy is informed by **ABMS** member boards and certificate listings — see [ABMS specialty & subspecialty certificates](https://www.abms.org/member-boards/specialty-subspecialty-certificates/). Allied and operational rows reflect common **imaging service line and capital committee** stakeholders, not a regulatory credential list.

---

*End of copy-paste prompt.*
