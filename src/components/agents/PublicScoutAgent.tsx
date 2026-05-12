import { useState } from "react";
import { Globe2, Search } from "lucide-react";
import { DEVICES } from "@/lib/atlas/data";
import { getCompetitors, type CompetitorRow } from "@/lib/fixtures/competitors";
import { SimulatedRunPanel, type RunOutput } from "./SimulatedRunPanel";

const STEPS = [
  { label: "Resolving device & region…", durationMs: 500 },
  { label: "Simulating public-source crawl…", durationMs: 1100 },
  { label: "De-duplicating competitor signals…", durationMs: 800 },
  { label: "Scoring claimed differentiators…", durationMs: 900 },
  { label: "Compiling competitor table…", durationMs: 600 },
];

export function PublicScoutAgent() {
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [rows, setRows] = useState<CompetitorRow[]>([]);

  const start = () => {
    setStatus("running"); setOutput(null); setRows([]);
    const total = STEPS.reduce((a, s) => a + (s.durationMs ?? 800), 0);
    setTimeout(() => {
      const r = getCompetitors(deviceId, region);
      setRows(r);
      setOutput({
        summary: `Simulated scout completed for ${DEVICES.find(d => d.id === deviceId)!.name}${region ? ` · ${region}` : ""}.`,
        bullets: [
          `Identified ${r.length} peer products in the same modality bracket.`,
          "Differentiator claims are vendor-stated and not independently verified.",
          "Re-run on a schedule for trend tracking (not implemented in demo).",
        ],
        confidence: 72,
        sources: [{ label: "Simulated public sources", url: "#" }],
      });
      setStatus("done");
    }, total + 200);
  };

  const reset = () => { setStatus("idle"); setOutput(null); setRows([]); };

  return (
    <div className="space-y-4">
      <SimulatedRunPanel
        status={status === "done" ? "done" : status}
        steps={STEPS}
        onStart={start}
        onReset={reset}
        output={output}
        inputs={
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-md border border-border px-2">
              <Search className="size-3.5 text-muted-foreground" />
              <select value={deviceId} onChange={e => setDeviceId(e.target.value)}
                className="flex-1 h-9 bg-transparent text-xs outline-none">
                {DEVICES.map(d => <option key={d.id} value={d.id}>{d.modality} · {d.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border px-2">
              <Globe2 className="size-3.5 text-muted-foreground" />
              <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Region (optional, e.g. EMEA)"
                className="flex-1 h-9 bg-transparent text-xs outline-none" />
            </label>
          </div>
        }
      />

      {rows.length > 0 && (
        <div className="panel-elevated p-4">
          <div className="text-sm font-semibold mb-2">Competitor set (simulated)</div>
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
