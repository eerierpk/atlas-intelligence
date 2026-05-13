# MedIntel Atlas

AI-powered decision-intelligence workspace for hospital capital equipment and clinical infrastructure across the global medical technology industry. Frontend-only prototype.

## Documentation

- **Lovable / external builder — v2 scope (copy-paste):** [`docs/LOVABLE_ATLAS_V2_README.md`](./docs/LOVABLE_ATLAS_V2_README.md) — admin users, searchable dropdowns everywhere, responsive rules, agent chat UX, specialization appendix.

## Run

```
bun install
bun run dev
```

## Architecture

- **TanStack Start** + React 19 + TypeScript + Tailwind v4 + shadcn primitives + Recharts + Framer Motion + Lucide.
- File-based routes in `src/routes/`.
- In-memory state via `AtlasProvider` (`src/lib/atlas/store.tsx`) — no persistence.
- Mock data: `src/lib/atlas/data.ts` (demo catalog spanning MRI, CT, X-ray, ultrasound, mammography, PET/CT — representative systems from multiple OEMs; UI models industry-wide coverage).
- Pseudo-AI engine: `src/lib/atlas/ai.ts` — rule-based scenario parser + weighted scoring + templated reply.
- Design tokens & glass panels: `src/styles.css`.

## Pages

`/login` · `/dashboard` · `/explore` · `/devices/$deviceId` · `/compare` · `/assistant` · `/insights` · `/saved` · `/agents` · `/journey` · `/journey/$deviceId` · `/roi`

## Demo Script (5 min)

1. **Login** — use any email/password or click *Continue as Demo User*.
2. **Command Center** — show the AI hero search, KPI counters, recommendation strip, vendor activity feed, trend chart.
3. **Devices** — open floating filters, apply vendor/tier/AI filters, confirm selected chips are shown, then open a device.
4. **Device Detail** — tour tabs (Overview → Technical → AI Features → Financial). Highlight the right-side AI Intelligence Panel (strengths, tradeoffs, confidence, provenance).
5. **Compare** — add 3 devices via Devices, open `/compare`, walk grouped matrix, radar tradeoff chart, AI best-fit-by-scenario, click *Save snapshot* / *Export*.
6. **AI Assistant** — type *"Best MRI for neuro + oncology with moderate budget"*, show ranked answer with referenced devices (clickable), confidence and decision-trail rationale.
7. **Insights** — vendor momentum, AI maturity distribution, clinical demand pie, market pulse.
8. **Saved Workspace** — show session-only saved devices, comparisons, AI sessions.
9. **Cmd/Ctrl+K** — command palette across devices, navigation, AI prompts; use sidebar collapse toggle (now pinned at top for quick access).

## Simulated vs Real

- **Simulated**: authentication (any input works), all device data, AI responses (deterministic templates), vendor feed, market pulse, exports.
- **Real**: routing, Devices catalog filters (local to Explore), scoring engine, in-session state, charts, command palette, client-side HTML report export, share link encoding, mailto summary.

## Trust UX

Every AI output ships with confidence %, decision-trail rationale and source provenance chips. Persistent disclaimer: *For planning/procurement intelligence only — not diagnostic guidance.*
