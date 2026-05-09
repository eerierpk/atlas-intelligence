import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, GitCompare, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { MAX_COMPARE_DEVICES, useAtlas } from "@/lib/atlas/store";
import { getDevice } from "@/lib/atlas/data";
import { Bar, BarChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { downloadHtmlReport } from "@/lib/atlas/share";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const { comparisonIds, toggleCompare, clearCompare, saveComparison } = useAtlas();
  const devices = comparisonIds.map(getDevice).filter(Boolean) as NonNullable<ReturnType<typeof getDevice>>[];

  if (devices.length === 0) {
    return (
      <AppShell>
        <div className="panel-elevated p-12 text-center">
          <GitCompare className="size-8 mx-auto text-[var(--color-primary)]" />
          <h2 className="mt-3 text-lg font-semibold">Comparison Workspace</h2>
          <p className="text-sm text-muted-foreground mt-1">{`Add 2–${MAX_COMPARE_DEVICES} devices from Devices to start a side-by-side comparison.`}</p>
          <Link to="/explore" className="mt-4 inline-flex chip chip-accent">Browse devices →</Link>
        </div>
      </AppShell>
    );
  }

  const radarData = ["AI", "Throughput", "Uptime", "Cost-Eff", "Low-Maint"].map(metric => {
    const row: Record<string, string | number> = { metric };
    devices.forEach(d => {
      let v = 0;
      if (metric === "AI") v = d.aiMaturity * 20;
      if (metric === "Throughput") v = Math.min(100, d.throughputPerDay);
      if (metric === "Uptime") v = (d.uptimePct - 95) * 25;
      if (metric === "Cost-Eff") v = Math.max(0, 100 - d.estCostUSDm * 30);
      if (metric === "Low-Maint") v = (6 - d.maintenanceBurden) * 20;
      row[d.name] = Math.round(v);
    });
    return row;
  });

  const costData = devices.map(d => ({ name: d.name.split(" ").slice(0, 2).join(" "), capex: d.estCostUSDm, perScan: d.costPerScanUSD }));

  const groups: { title: string; rows: { label: string; get: (d: typeof devices[number]) => React.ReactNode; key: string }[] }[] = [
    { title: "Identity", rows: [
      { label: "Vendor", key: "vendor", get: d => d.vendor },
      { label: "Modality", key: "modality", get: d => d.modality },
      { label: "Year", key: "year", get: d => d.releaseYear },
    ]},
    { title: "Technical", rows: [
      { label: "Field / Slices", key: "fs", get: d => d.modality === "MRI" ? `${d.fieldStrengthT}T` : `${d.sliceCount} slices` },
      { label: "Throughput", key: "tp", get: d => `${d.throughputPerDay}/d` },
      { label: "Uptime", key: "up", get: d => `${d.uptimePct}%` },
    ]},
    { title: "Operational", rows: [
      { label: "Complexity", key: "cplx", get: d => d.complexity },
      { label: "Setup", key: "setup", get: d => `${d.setupWeeks} wk` },
      { label: "Maint. burden", key: "mb", get: d => `${d.maintenanceBurden}/5` },
    ]},
    { title: "Financial", rows: [
      { label: "Capex", key: "capex", get: d => `$${d.estCostUSDm.toFixed(2)}M` },
      { label: "Cost/scan", key: "cps", get: d => `$${d.costPerScanUSD}` },
      { label: "ROI", key: "roi", get: d => `${d.roiYears} yr` },
    ]},
    { title: "AI", rows: [
      { label: "AI maturity", key: "aim", get: d => `${d.aiMaturity}/5` },
      { label: "Capabilities", key: "cap", get: d => d.aiCapabilities.slice(0, 2).join(", ") },
    ]},
    { title: "Compatibility", rows: [
      { label: "Standards", key: "std", get: d => d.standards.join(", ") },
    ]},
    { title: "Clinical fit", rows: [
      { label: "Tags", key: "tags", get: d => d.clinicalTags.join(", ") },
    ]},
  ];

  const bestByScenario = [
    { scenario: "Best AI maturity", winner: [...devices].sort((a, b) => b.aiMaturity - a.aiMaturity)[0] },
    { scenario: "Best throughput", winner: [...devices].sort((a, b) => b.throughputPerDay - a.throughputPerDay)[0] },
    { scenario: "Lowest capex", winner: [...devices].sort((a, b) => a.estCostUSDm - b.estCostUSDm)[0] },
  ];
  const onExport = () => {
    const html = `<h1>MedIntel Atlas — Comparison Snapshot</h1>
      <p class="muted">Generated ${new Date().toLocaleString()}</p>
      <h2>Compared devices (${devices.length})</h2>
      <table><thead><tr><th>Name</th><th>Vendor</th><th>Modality</th><th>AI</th><th>Throughput</th><th>Capex</th></tr></thead><tbody>
      ${devices.map(d => `<tr><td>${d.name}</td><td>${d.vendor}</td><td>${d.modality}</td><td>${d.aiMaturity}/5</td><td>${d.throughputPerDay}/day</td><td>$${d.estCostUSDm.toFixed(2)}M</td></tr>`).join("")}
      </tbody></table>`;
    downloadHtmlReport({ title: `Comparison Snapshot ${devices.length} devices`, summary: "Comparison export", deviceIds: devices.map(d => d.id) }, html);
  };

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comparison Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">{devices.length} device{devices.length > 1 ? "s" : ""} side-by-side · spec matrix, radar trade-offs, save snapshot, and HTML export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { saveComparison(`Comparison · ${devices.length} devices`); toast.success("Comparison saved to workspace"); }} className="h-9 px-3 rounded-md border border-border text-sm">Save snapshot</button>
          <button onClick={onExport} className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5"><Download className="size-4" /> Export</button>
          <button onClick={clearCompare} className="h-9 px-3 rounded-md border border-border text-sm hover:border-destructive/40 hover:text-destructive">Clear</button>
        </div>
      </div>

      {/* Matrix */}
      <div className="mt-5 panel-elevated overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--color-surface-elevated)] z-10">
            <tr>
              <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground w-44">Attribute</th>
              {devices.map(d => (
                <th key={d.id} className="text-left p-3 min-w-[180px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground">{d.vendor}</div>
                      <Link to="/devices/$deviceId" params={{ deviceId: d.id }} className="font-semibold hover:text-[var(--color-primary)]">{d.name}</Link>
                    </div>
                    <button onClick={() => toggleCompare(d.id)} className="text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <>
                <tr key={g.title}><td colSpan={devices.length + 1} className="bg-[var(--color-surface)]/40 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-semibold">{g.title}</td></tr>
                {g.rows.map(r => (
                  <tr key={r.key} className="border-t border-border">
                    <td className="p-3 text-xs text-muted-foreground">{r.label}</td>
                    {devices.map(d => <td key={d.id} className="p-3 text-mono text-xs">{r.get(d)}</td>)}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI best-fit + charts */}
      <div className="mt-5 grid lg:grid-cols-3 gap-4">
        <div className="panel-elevated p-4 lg:col-span-1">
          <div className="text-xs font-semibold flex items-center gap-1.5"><Sparkles className="size-3.5 text-[var(--color-primary)]" /> AI · Best fit by scenario</div>
          <ul className="mt-3 flex flex-col gap-2">
            {bestByScenario.map(({ scenario, winner }) => (
              <li key={scenario} className="rounded-md border border-border p-3">
                <div className="text-[11px] text-muted-foreground">{scenario}</div>
                <Link to="/devices/$deviceId" params={{ deviceId: winner.id }} className="text-sm font-semibold hover:text-[var(--color-primary)]">{winner.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-elevated p-4 lg:col-span-1">
          <div className="text-xs font-semibold mb-2">Tradeoff radar</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.4 0.03 230 / 0.3)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "oklch(0.7 0.02 240)" }} />
                {devices.map((d, i) => (
                  <Radar key={d.id} name={d.name} dataKey={d.name} stroke={`var(--color-chart-${(i % 5) + 1})`} fill={`var(--color-chart-${(i % 5) + 1})`} fillOpacity={0.18} />
                ))}
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 250)", border: "1px solid oklch(0.4 0.03 230 / 0.3)", borderRadius: 8, fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel-elevated p-4 lg:col-span-1">
          <div className="text-xs font-semibold mb-2">Cost profile</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" stroke="oklch(0.6 0.02 240)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 240)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 250)", border: "1px solid oklch(0.4 0.03 230 / 0.3)", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="capex" fill="oklch(0.78 0.13 195)" radius={[4,4,0,0]} />
                <Bar dataKey="perScan" fill="oklch(0.7 0.13 230)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
