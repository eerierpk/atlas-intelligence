import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/atlas/AppShell";
import { DEVICES, MARKET_PULSE, VENDORS } from "@/lib/atlas/data";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const vendorData = VENDORS.map(v => ({ name: v.name.split(" ")[0], momentum: v.momentum, devices: DEVICES.filter(d => d.vendor === v.name).length }));
  const aiData = [1,2,3,4,5].map(level => ({ level: `${level}/5`, count: DEVICES.filter(d => d.aiMaturity === level).length }));
  const tagDist: Record<string, number> = {};
  DEVICES.forEach(d => d.clinicalTags.forEach(t => { tagDist[t] = (tagDist[t] ?? 0) + 1; }));
  const tagData = Object.entries(tagDist).map(([name, value]) => ({ name, value }));
  const colors = ["oklch(0.78 0.13 195)", "oklch(0.7 0.13 230)", "oklch(0.72 0.15 160)", "oklch(0.78 0.15 75)", "oklch(0.68 0.18 305)"];

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Market Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Cross-vendor signals, AI adoption and modality demand patterns.</p>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <Card title="Vendor momentum" subtitle="Atlas composite score · 0–100">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vendorData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="momentum" fill="oklch(0.78 0.13 195)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="AI maturity distribution" subtitle="Number of devices per maturity tier">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={aiData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="level" stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="count" fill="oklch(0.7 0.13 230)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Clinical demand distribution" subtitle="Device coverage by clinical tag">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip contentStyle={tip} />
              <Pie data={tagData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {tagData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {tagData.map((t, i) => <span key={t.name} className="chip" style={{ borderColor: colors[i % colors.length] }}>{t.name} · {t.value}</span>)}
          </div>
        </Card>

        <Card title="Operational efficiency" subtitle="Throughput vs cost-per-scan">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEVICES.slice(0, 8).map(d => ({ name: d.name.split(" ").slice(0,2).join(" "), throughput: d.throughputPerDay, cost: d.costPerScanUSD }))} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" stroke="oklch(0.6 0.02 240)" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-15} dy={8} />
              <YAxis stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="throughput" fill="oklch(0.72 0.15 160)" radius={[4,4,0,0]} />
              <Bar dataKey="cost" fill="oklch(0.78 0.15 75)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight mb-3">Market pulse</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {MARKET_PULSE.map(m => (
            <div key={m.title} className="panel-elevated p-4">
              <div className="text-sm font-semibold">{m.title}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

const tip = { background: "oklch(0.22 0.025 250)", border: "1px solid oklch(0.4 0.03 230 / 0.3)", borderRadius: 8, fontSize: 12 };

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="panel-elevated p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}
