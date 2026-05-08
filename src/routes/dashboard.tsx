import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Bookmark, Cpu, GitCompare, LineChart as LineChartIcon, Search, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { ConfidenceBadge, DeviceCard } from "@/components/atlas/DeviceCard";
import { DEVICES, MARKET_PULSE, VENDORS, VENDOR_FEED } from "@/lib/atlas/data";
import { rankDevices } from "@/lib/atlas/ai";
import { useAtlas } from "@/lib/atlas/store";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  AI: 40 + Math.round(Math.sin(i / 2) * 8) + i * 4,
  Throughput: 60 + Math.round(Math.cos(i / 2) * 6) + i * 2,
}));

function Dashboard() {
  const { user, recentDeviceIds, savedDevices } = useAtlas();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const oncologyMRI = rankDevices({ budget: 4, throughput: 5, ai: 8, clinical: ["oncology", "neuro"], modality: "MRI" }, 1)[0]?.device;
  const erCT = rankDevices({ budget: 4, throughput: 9, ai: 6, clinical: ["emergency", "trauma"], modality: "CT" }, 1)[0]?.device;
  const cheapCT = rankDevices({ budget: 9, throughput: 7, ai: 4, clinical: ["abdominal"], modality: "CT" }, 1)[0]?.device;

  return (
    <AppShell right={<RightRail />}>
      {/* Hero command bar */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="absolute inset-0 grid-bg opacity-30 rounded-2xl" />
        <div className="relative glass-panel rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-2 chip chip-accent w-fit"><Sparkles className="size-3" /> Intelligence Command Center</div>
          <div className="mt-3 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Welcome back, {user?.name.split(" ")[0]}.</h1>
              <p className="text-sm text-muted-foreground mt-1">Atlas is monitoring 16 imaging systems across 4 vendors. Ask anything.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              Live · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/assistant", search: { q } as never }); }}
            className="mt-5 flex items-center gap-2 h-12 px-3 rounded-lg bg-[var(--color-input)]/70 border border-border focus-within:border-primary"
          >
            <Sparkles className="size-4 text-[var(--color-primary)]" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder='Ask Atlas: "Best MRI for neuro + oncology with moderate budget…"'
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button className="h-9 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-1">
              Ask <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Best MRI for neuro + oncology", "Compare Siemens vs GE CT for trauma", "High throughput CT for ER", "Cost-efficient 1.5T MRI"].map(p => (
              <button key={p} onClick={() => navigate({ to: "/assistant", search: { q: p } as never })} className="chip hover:chip-accent">{p}</button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* KPI strip */}
      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={<Cpu className="size-4" />} label="MRI systems" value={DEVICES.filter(d => d.modality === "MRI").length} delta="+2 indexed" />
        <KPI icon={<Zap className="size-4" />} label="CT systems" value={DEVICES.filter(d => d.modality === "CT").length} delta="+3 indexed" />
        <KPI icon={<Activity className="size-4" />} label="Avg AI maturity" value={(DEVICES.reduce((s, d) => s + d.aiMaturity, 0) / DEVICES.length).toFixed(1) + "/5"} delta="↑ trending" />
        <KPI icon={<TrendingUp className="size-4" />} label="Saved items" value={savedDevices.length} delta="session" />
      </section>

      {/* AI recommendations strip */}
      <section className="mt-6">
        <SectionHeader title="AI Recommendations" subtitle="Best fits inferred from common procurement scenarios." />
        <div className="grid md:grid-cols-3 gap-3">
          <RecCard title="Best MRI for oncology center" device={oncologyMRI} reason="Highest AI-maturity 3T platforms with oncology + neuro fit." />
          <RecCard title="High-throughput CT for ER" device={erCT} reason="Optimized for trauma & emergency volume." />
          <RecCard title="Cost-efficient CT pick" device={cheapCT} reason="Low TCO with healthy throughput." />
        </div>
      </section>

      {/* Charts + feed */}
      <section className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="panel-elevated p-4 lg:col-span-2">
          <SectionHeader title="Trend snapshot" subtitle="Industry signals · last 12 months" small icon={<LineChartIcon className="size-4 text-[var(--color-primary)]" />} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 195)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.13 230)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.7 0.13 230)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 250)", border: "1px solid oklch(0.4 0.03 230 / 0.3)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="AI" stroke="oklch(0.78 0.13 195)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Throughput" stroke="oklch(0.7 0.13 230)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-elevated p-4 flex flex-col">
          <SectionHeader title="Vendor activity" subtitle="Live feed" small />
          <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1">
            {VENDOR_FEED.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-2.5 hover:border-primary/30 transition">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">{f.vendor}</span>
                  <span>{f.time}</span>
                </div>
                <p className="text-xs mt-1 text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent / saved */}
      <section className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="panel-elevated p-4">
          <SectionHeader title="Recently viewed" subtitle="Session history" small icon={<Search className="size-4 text-[var(--color-primary)]" />} />
          {recentDeviceIds.length === 0 ? (
            <EmptyState text="No recent devices yet — explore the catalog to see history here." action={<Link to="/explore" className="chip chip-accent">Browse devices →</Link>} />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recentDeviceIds.map(id => {
                const d = DEVICES.find(x => x.id === id)!;
                return (
                  <li key={id}>
                    <Link to="/devices/$deviceId" params={{ deviceId: id }} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[var(--color-secondary)]/40 text-sm">
                      <span className="chip">{d.modality}</span>
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground text-xs ml-auto">{d.vendor}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="panel-elevated p-4">
          <SectionHeader title="Saved items" subtitle="Workspace shortcuts" small icon={<Bookmark className="size-4 text-[var(--color-primary)]" />} />
          {savedDevices.length === 0 ? (
            <EmptyState text="Bookmark devices to keep them here for the session." action={<Link to="/explore" className="chip chip-accent">Find devices →</Link>} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {savedDevices.map(id => {
                const d = DEVICES.find(x => x.id === id)!;
                return (
                  <Link key={id} to="/devices/$deviceId" params={{ deviceId: id }} className="rounded-md border border-border p-2.5 hover:border-primary/30">
                    <div className="text-[10px] text-muted-foreground">{d.vendor} · {d.modality}</div>
                    <div className="text-sm font-medium">{d.name}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function KPI({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: React.ReactNode; delta: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let raf = 0; const start = performance.now(); const dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (0.5 - 0.5 * Math.cos(Math.PI * p))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="panel-elevated p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">{icon}{label}</span>
        <span className="text-[var(--color-success)]">{delta}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-mono">{typeof value === "number" ? n : value}</div>
    </motion.div>
  );
}

function RecCard({ title, device, reason }: { title: string; device?: { id: string; name: string; vendor: string; modality: string; confidence: number } | null; reason: string }) {
  if (!device) return null;
  return (
    <Link to="/devices/$deviceId" params={{ deviceId: device.id }} className="panel-elevated p-4 hover:border-primary/40 transition flex flex-col gap-3 group">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="size-3.5 text-[var(--color-primary)]" /> {title}
      </div>
      <div>
        <div className="text-base font-semibold tracking-tight group-hover:text-[var(--color-primary)]">{device.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{device.vendor} · {device.modality}</div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <ConfidenceBadge value={device.confidence} />
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-[var(--color-primary)]" />
      </div>
    </Link>
  );
}

function SectionHeader({ title, subtitle, small, icon }: { title: string; subtitle?: string; small?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`flex items-end justify-between mb-3 ${small ? "" : "mb-4"}`}>
      <div>
        <div className={`flex items-center gap-1.5 ${small ? "text-sm" : "text-base"} font-semibold tracking-tight`}>{icon}{title}</div>
        {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}

function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center">
      <p className="text-xs text-muted-foreground">{text}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

function RightRail() {
  return (
    <div className="flex flex-col gap-4">
      <div className="glass-panel rounded-lg p-4">
        <div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-3.5 text-[var(--color-primary)]" /> AI Intelligence Panel</div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Atlas continuously ranks systems by your scenario weights. Open the AI Assistant to refine criteria.
        </p>
        <Link to="/assistant" className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
          Open Assistant <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="panel-elevated p-4">
        <div className="text-xs font-semibold mb-2">Vendor momentum</div>
        <div className="flex flex-col gap-2">
          {VENDORS.map(v => (
            <div key={v.name}>
              <div className="flex items-center justify-between text-[11px]">
                <span>{v.name}</span>
                <span className="text-mono text-muted-foreground">{v.momentum}</span>
              </div>
              <div className="h-1.5 mt-1 rounded-full bg-[var(--color-secondary)] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)]" style={{ width: `${v.momentum}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-elevated p-4">
        <div className="text-xs font-semibold mb-2">Market pulse</div>
        <div className="flex flex-col gap-2">
          {MARKET_PULSE.slice(0, 2).map(m => (
            <div key={m.title} className="text-[11px]">
              <div className="font-medium">{m.title}</div>
              <p className="text-muted-foreground leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
        <Link to="/insights" className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
          See all insights <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
