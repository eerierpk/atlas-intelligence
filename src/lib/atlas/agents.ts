import type { Agent } from "./types";

export const AGENTS: Agent[] = [
  {
    id: "agent-vendor-intel",
    name: "Vendor Intel",
    description: "Monitors vendor announcements, install-base shifts, and platform updates across MRI/CT/X-ray suppliers.",
    status: "running",
    lastRun: "12 min ago",
    confidence: 88,
    dataSources: ["Vendor newsroom feeds", "Public spec sheets", "Atlas internal benchmarks"],
    tasks: [
      { id: "t1", title: "Index Siemens NAEOTOM Alpha PCD-CT updates", state: "done", ts: "12 min ago" },
      { id: "t2", title: "Diff Philips MR 5300 firmware notes", state: "running", ts: "now" },
      { id: "t3", title: "Crawl Canon Medical EU pricing signals", state: "queued", ts: "—" },
    ],
    logs: [
      { ts: "12:42", level: "ok", msg: "Pulled 14 vendor signals (mock extraction)." },
      { ts: "12:43", level: "info", msg: "Tagged 3 entries as material change → propagated to Insights." },
      { ts: "12:44", level: "warn", msg: "Confidence below 80% on Canon pricing leak — flagged for review." },
    ],
  },
  {
    id: "agent-throughput",
    name: "Throughput Forecaster",
    description: "Projects fleet throughput and bottlenecks given device mix, scenario weights, and uptime distributions.",
    status: "idle",
    lastRun: "1h ago",
    confidence: 81,
    dataSources: ["Catalog throughput specs", "Scenario weights", "Synthetic site profiles"],
    tasks: [
      { id: "t1", title: "Forecast Q2 MRI volume — academic site", state: "done", ts: "1h ago" },
      { id: "t2", title: "Stress test ER CT swap → photon-counting", state: "done", ts: "1h ago" },
    ],
    logs: [
      { ts: "11:31", level: "ok", msg: "Simulated 12-month throughput envelope across 4 mixes." },
      { ts: "11:32", level: "info", msg: "Bottleneck identified: pre-scan patient prep, not scanner capacity." },
    ],
  },
  {
    id: "agent-tco",
    name: "TCO Analyst",
    description: "Decomposes total-cost-of-ownership across capex, service contracts, helium, power, and downtime risk.",
    status: "needs-review",
    lastRun: "3h ago",
    confidence: 74,
    dataSources: ["Capex priors", "Service tier templates", "Energy benchmarks"],
    tasks: [
      { id: "t1", title: "Compute 7-yr TCO for 3T MRI shortlist", state: "done", ts: "3h ago" },
      { id: "t2", title: "Reconcile helium-free vs cryogenic baseline", state: "done", ts: "3h ago" },
    ],
    logs: [
      { ts: "09:51", level: "ok", msg: "Generated TCO envelope with ±12% bands." },
      { ts: "09:52", level: "warn", msg: "Helium price input stale (90+ days) — review before publishing." },
    ],
  },
  {
    id: "agent-clinical-fit",
    name: "Clinical Fit Mapper",
    description: "Maps clinical workflows to vendor capability claims and Atlas-tagged device strengths.",
    status: "idle",
    lastRun: "yesterday",
    confidence: 86,
    dataSources: ["Atlas clinical tags", "Vendor protocol packs", "Mocked literature corpus"],
    tasks: [
      { id: "t1", title: "Score CT trauma protocol fit across vendors", state: "done", ts: "yesterday" },
    ],
    logs: [
      { ts: "yesterday", level: "ok", msg: "Refreshed 92 fit scores; no material drift." },
    ],
  },
];

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id);
}
