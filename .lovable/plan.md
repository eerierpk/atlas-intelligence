# MedIntel Atlas v2 — Build Plan

Additive changes; preserves existing app shell, theme, device catalog, journey, ROI, and current routes.

## 1. Searchable Combobox primitive (global)

New `src/components/ui/searchable-combobox.tsx` built on existing `cmdk` + `Popover` (already in shadcn). Single + multi-select variants with:
- type-to-filter, arrow keys, Enter/Esc, click-outside, clear button, "No matches" empty state, chip rendering for multi
- ARIA listbox roles, focus-visible rings, 44px min targets on touch
- Used everywhere lists are picked: gender, role, specializations, region/modality filters in Explore/Compare, agent switcher, admin role picker, signup-style fields wherever they remain. Sweep replaces `<select>` and ad-hoc dropdowns in: `explore.tsx`, `compare.tsx`, `roi.tsx`, `agents.tsx`, `journey.tsx`, hospitals filter, AppShell user menu where applicable.

## 2. Admin module

- Add `Admin` to `UserRole` enum in `src/lib/atlas/types.ts` + permissions map
- New `src/routes/admin.tsx` — gated by `Admin` role (redirect to dashboard otherwise); sidebar entry with `ShieldCheck` icon shown only for admins
- `src/lib/atlas/admin-store.ts` — in-memory + `localStorage` user directory; seeds 1 admin (`admin@medintel.io`) and a few sample users
- Components in `src/components/admin/`:
  - `UserTable.tsx` — name, email, role, status, last login, created, gender, specialization chips; mobile = card list
  - `CreateUserDialog.tsx` — name, email, role combobox, gender combobox (Male / Female / Do not want to specify), specialization multi-select from Appendix A, optional title/department/phone
  - `EditUserDialog.tsx`, deactivate, reset access (mock)
  - `CredentialsModal.tsx` — "Simulated email queued" with copyable temp password; Demo Outbox panel of last 10
- New seed admin demo login button on `/login` (replaces signup wizard button)

## 3. Specialization taxonomy

- `src/lib/atlas/specializations.ts` — Appendix A flat list + group labels (Physician / Subspecialty / Allied)
- Used by admin create/edit and profile model

## 4. Profile model + signup removal

- Extend `UserProfile` with `gender`, `specializations: string[]`, `title`, `credentials`, `yearsExperience`
- `src/routes/login.tsx`: remove SignupWizard button + modal mount; keep only sign in + demo + demo expert + (new) demo admin
- `SignupWizard.tsx` left in repo but unmounted (no broken imports). Add a "Request access" link that opens a small toast/dialog explaining admin provisioning.

## 5. Chat-first Agents (Ask AI panel refactor)

- Refactor `AtlasChatPanel.tsx`:
  - Add **agent switcher** at top: searchable combobox with `Ask Atlas`, `Intel Expert`, `Document / Video Ingest`, `Public Web Scout`
  - Per-agent **separate thread state** kept in `ai-panel-context` (`Record<AgentId, AIMessage[]>`)
  - Collapsible "How this agent works" header per agent (inputs, guardrails, simulated latency)
  - Composer toolbar: file upload chip, URL chip, device chip → render as input summary chips on user message
  - Assistant messages render structured sections: Summary · Key bullets · Table/cards · Sources (simulated) · Confidence · Next steps (extend `AIMessage` shape with optional `structured` block; existing renderer keeps backward compat)
  - Smooth 200ms fade/slide on agent switch
- `/agents` route becomes a **launcher**: cards that open the panel pre-selected to that agent (existing simulation components still accessible via "Open detailed run")

## 6. Responsive pass

- AppShell: sidebar already has mobile drawer; verify and add bottom safe-area + hamburger visible <768px; ensure no horizontal overflow
- Tables in admin, hospitals, compare → wrap in `overflow-x-auto` with sticky first col, OR mobile card fallback (admin gets card fallback)
- Modals: `max-w-full sm:max-w-lg` pattern; full-height sheet for Ask AI on `<sm`
- Audit pages at 375 / 768 / 1280 via browser tool after build

## 7. Polish

- Focus-visible ring tokens already in styles.css; ensure combobox uses them
- Skeletons stay as-is; add empty states to admin user list

## File map

**New**
- `src/components/ui/searchable-combobox.tsx`
- `src/lib/atlas/specializations.ts`
- `src/lib/atlas/admin-store.ts`
- `src/routes/admin.tsx`
- `src/components/admin/{UserTable,CreateUserDialog,EditUserDialog,CredentialsModal}.tsx`
- `src/components/agents/AgentSwitcher.tsx`

**Edited**
- `src/lib/atlas/types.ts` (Admin role, profile fields, AIMessage.structured, AgentId)
- `src/lib/atlas/permissions.ts` (Admin perms)
- `src/lib/atlas/store.tsx` (admin login seed, profile fields)
- `src/lib/atlas/ai-panel-context.tsx` (per-agent thread state, current agent)
- `src/components/atlas/AtlasChatPanel.tsx` (agent switcher, structured rendering, composer)
- `src/components/atlas/AppShell.tsx` (admin nav entry, mobile polish)
- `src/routes/login.tsx` (remove signup, add demo admin)
- `src/routes/agents.tsx` (launcher cards)
- `src/routes/explore.tsx`, `compare.tsx`, `roi.tsx`, `journey.tsx`, hospitals filter (combobox sweep)

## Out of scope
- Real auth/SMTP, real RBAC server, real agent backends — all simulated with clear labels.
