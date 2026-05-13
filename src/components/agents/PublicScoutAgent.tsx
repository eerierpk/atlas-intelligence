import { useState } from "react";
import { FileDown, Globe2, Search } from "lucide-react";
import { DEVICES } from "@/lib/atlas/data";
import { getCompetitors, type CompetitorRow } from "@/lib/fixtures/competitors";
import { SimulatedRunPanel, type RunOutput } from "./SimulatedRunPanel";

const STEPS = [
  { label: "Resolving device & region…", durationMs: 500 },
  { label: "Simulating public-source crawl…", durationMs: 1100 },
  { label: "De-duplicating competitor signals…", durationMs: 800 },
  { label: "Scoring claimed differentiators…", durationMs: 900 },
  { label: "Compiling competitor table…", durationMs: 600 },
  { label: "Publishing snapshot for human review…", durationMs: 550 },
];

export function PublicScoutAgent() {
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [rows, setRows] = useState<CompetitorRow[]>([]);

  const selectedDevice = DEVICES.find(d => d.id === deviceId) ?? DEVICES[0];

  const start = () => {
    setStatus("running"); setOutput(null); setRows([]);
    const total = STEPS.reduce((a, s) => a + (s.durationMs ?? 800), 0);
    setTimeout(() => {
      const r = getCompetitors(deviceId, region);
      setRows(r);
      setOutput({
        summary: `Simulated scout completed for ${selectedDevice.name}${region ? ` · ${region}` : ""}.`,
        bullets: [
          `Identified ${r.length} peer products in the same modality bracket.`,
          "Differentiator claims are vendor-stated and not independently verified.",
          "Snapshot is queued for human review before any procurement action (simulated handoff).",
        ],
        confidence: 72,
        sources: [{ label: "Simulated public sources", url: "#" }],
      });
      setStatus("done");
    }, total + 200);
  };

  const reset = () => { setStatus("idle"); setOutput(null); setRows([]); };

  const slug = `${selectedDevice.modality}-${selectedDevice.name}`.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

  const exportReportTxt = () => {
    if (!output || rows.length === 0) return;
    const when = new Date().toISOString();
    const lines: string[] = [
      "Atlas Intelligence — Public web scout (simulated)",
      "==============================================",
      `Generated (local): ${when}`,
      "",
      "Scope",
      "-----",
      `Device: ${selectedDevice.name} (${selectedDevice.vendor})`,
      `Modality: ${selectedDevice.modality}`,
      `Region filter: ${region || "(none)"}`,
      "",
      "Summary",
      "-------",
      output.summary,
      "",
      "Highlights",
      "----------",
      ...output.bullets.map((b) => `• ${b}`),
      "",
      "Simulated confidence: " + `${output.confidence}%`,
      "",
      "Competitor table",
      "----------------",
      "Product\tVendor\tClaimed differentiator\tLast seen",
      ...rows.map((r) => [r.product, r.vendor, r.differentiator, r.lastSeen].join("\t")),
      "",
      "Disclaimer: illustrative data only; not verified competitive intelligence.",
    ];
    downloadBlob(`scout-report-${slug}.txt`, lines.join("\n"), "text/plain;charset=utf-8");
  };

  const exportTableCsv = () => {
    if (rows.length === 0) return;
    const header = ["Product", "Vendor", "Claimed differentiator", "Last seen"];
    const body = rows.map((r) => [r.product, r.vendor, r.differentiator, r.lastSeen].map(escapeCsvCell).join(","));
    const csv = [header.join(","), ...body].join("\r\n");
    downloadBlob(`scout-competitors-${slug}.csv`, csv, "text/csv;charset=utf-8");
  };

  return (
    <div className="space-y-4">
      <SimulatedRunPanel
        status={status === "done" ? "done" : status}
        steps={STEPS}
        onStart={start}
        onReset={reset}
        output={output}
        inputs={
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border px-2 py-0.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <select
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                title={`${selectedDevice.modality} · ${selectedDevice.name}`}
                className="h-9 min-h-0 min-w-0 w-full flex-1 cursor-pointer bg-transparent text-xs outline-none"
              >
                {DEVICES.map(d => (
                  <option key={d.id} value={d.id}>{d.modality} · {d.name}</option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border px-2 py-0.5">
              <Globe2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="Region (optional)"
                title="Optional region filter, e.g. EMEA, North America"
                className="h-9 min-w-0 w-full flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>
        }
      />

      {rows.length > 0 && (
        <div className="panel-elevated p-4">
          <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">Competitor set (simulated)</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportReportTxt}
                disabled={!output}
                className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-[var(--color-surface)] px-2.5 text-[11px] disabled:opacity-40"
              >
                <FileDown className="size-3.5 shrink-0" aria-hidden />
                Export report (.txt)
              </button>
              <button
                type="button"
                onClick={exportTableCsv}
                className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-[var(--color-surface)] px-2.5 text-[11px]"
              >
                <FileDown className="size-3.5 shrink-0" aria-hidden />
                Export table (.csv)
              </button>
            </div>
          </div>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[var(--color-secondary)]/60">
                <tr>
                  <Th>Product</Th><Th>Vendor</Th><Th>Claimed differentiator</Th><Th>Last seen</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i % 2 ? "bg-[var(--color-surface)]/30" : ""}>
                    <Td className="font-medium">{r.product}</Td>
                    <Td>{r.vendor}</Td>
                    <Td className="text-muted-foreground">{r.differentiator}</Td>
                    <Td className="text-mono">{r.lastSeen}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left px-3 py-2 font-medium text-muted-foreground border-b border-border">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-3 py-2 border-b border-border/60 ${className}`}>{children}</td>; }

function escapeCsvCell(s: string): string {
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
