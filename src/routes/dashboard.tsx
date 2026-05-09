import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, Bookmark, GitCompare, LineChart as LineChartIcon,
  Search, Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { ConfidenceBadge, DeviceCard } from "@/components/atlas/DeviceCard";
import { DEVICES, VENDOR_FEED } from "@/lib/atlas/data";
import { rankDevices } from "@/lib/atlas/ai";
import { useAtlas } from "@/lib/atlas/store";
import type { Modality, Vendor } from "@/lib/atlas/types";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  AI: 40 + Math.round(Math.sin(i / 2) * 8) + i * 4,
  Throughput: 60 + Math.round(Math.cos(i / 2) * 6) + i * 2,
}));

const MODALITY_OPTIONS: Modality[] = ["MRI", "CT", "X-ray", "Ultrasound", "Mammography", "PET/CT"];
const VENDOR_OPTIONS: Vendor[] = ["Siemens Healthineers", "GE HealthCare", "Philips", "Canon Medical", "Hologic", "Fujifilm"];

const MOD_COLORS: Record<Modality, string> = {
  "MRI": "var(--color-chart-1)",
  "CT": "var(--color-chart-2)",
  "X-ray": "var(--color-chart-3)",
  "Ultrasound": "var(--color-chart-4)",
  "Mammography": "var(--color-chart-5)",
  "PET/CT": "var(--color-info)",
};

function Dashboard() {
  const { user } = useAtlas();
  const navigate = useNavigate();
  const askRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"search" | "ask">("ask");
  const [q, setQ] = useState("");

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const inField = tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA");
      if (e.key === "/" && !inField) { e.preventDefault(); setMode("search"); setTimeout(() => searchRef.current?.focus(), 0); }
      if (e.shiftKey && e.key.toLowerCase() === "a" && !inField) { e.preventDefault(); setMode("ask"); setTimeout(() => askRef.current?.focus(), 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const oncologyMRI = rankDevices({ budget: 4, throughput: 5, ai: 8, clinical: ["oncology", "neuro"], modality: "MRI" }, 1)[0]?.device;
  const erCT = rankDevices({ budget: 4, throughput: 9, ai: 6, clinical: ["emergency", "trauma"], modality: "CT" }, 1)[0]?.device;
  const cheapCT = rankDevices({ budget: 9, throughput: 7, ai: 4, clinical: ["abdominal"], modality: "CT" }, 1)[0]?.device;

  const modalityShare = MODALITY_OPTIONS.map(m => ({
    name: m,
    value: DEVICES.filter(d => d.modality === m).length,
    fill: MOD_COLORS[m],
  })).filter(x => x.value > 0);

  const vendorBars = VENDOR_OPTIONS.map(v => ({
    name: v.split(" ")[0],
    devices: DEVICES.filter(d => d.vendor === v).length,
  })).filter(x => x.devices > 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "ask") navigate({ to: "/assistant", search: { q } as never });
    else navigate({ to: "/explore", search: { q } as never });
  };

  return (
    <AppShell right={<RightRail />}>
      {/* TOP AI INTELLIGENCE STRIP */}
      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="absolute inset-0 grid-bg opacity-30 rounded-2xl pointer-events-none" />
        <div className="relative glass-panel p-5 lg:p-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="chip chip-accent w-fit"><Sparkles className="size-3" /> Atlas Intelligence Strip</div>
              <h1 className="mt-2 text-xl lg:text-2xl font-semibold tracking-tight">Welcome back, {user?.name.split(" ")[0]}.</h1>
              <p className="text-sm text-muted-foreground mt-1">Industry-wide medical equipment intelligence — this workspace indexes {DEVICES.length} demo systems across {MODALITY_OPTIONS.length} equipment categories and a multi-OEM sample of the wider supplier landscape.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              Live · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Search vs Ask mode tabs */}
          <div className="mt-4 inline-flex p-1 rounded-md border border-border bg-[var(--color-secondary)]/40">
            <button onClick={() => setMode("search")} className={`px-3 h-8 rounded text-xs font-medium flex items-center gap-1.5 transition ${mode === "search" ? "bg-[var(--color-surface)] text-foreground border border-border" : "text-muted-foreground"}`}>
              <Search className="size-3.5" /> Search <kbd className="text-mono text-[10px] ml-1 px-1 rounded bg-[var(--color-secondary)]">/</kbd>
            </button>
            <button onClick={() => setMode("ask")} className={`px-3 h-8 rounded text-xs font-medium flex items-center gap-1.5 transition ${mode === "ask" ? "bg-[var(--color-surface)] text-foreground border border-border" : "text-muted-foreground"}`}>
              <Sparkles className="size-3.5" /> Ask AI <kbd className="text-mono text-[10px] ml-1 px-1 rounded bg-[var(--color-secondary)]">⇧A</kbd>
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-2 flex items-center gap-2 h-12 px-3 rounded-lg bg-[var(--color-input)] border border-border focus-within:border-primary">
            {mode === "search" ? <Search className="size-4 text-[var(--color-primary)]" /> : <Sparkles className="size-4 text-[var(--color-primary)]" />}
            {mode === "search" ? (
              <input ref={searchRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search devices, vendors, capabilities, modalities…" className="flex-1 bg-transparent outline-none text-sm" />
            ) : (
              <input ref={askRef} value={q} onChange={e => setQ(e.target.value)} placeholder='Ask Atlas: "Best MRI for neuro + oncology with moderate budget…"' className="flex-1 bg-transparent outline-none text-sm" />
            )}
            <button className="h-9 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-1">
              {mode === "ask" ? "Ask" : "Search"} <ArrowRight className="size-4" />
            </button>
          </form>

          {mode === "ask" ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Best MRI for neuro + oncology", "High-throughput CT for ER", "Cost-efficient mammography", "Premium PET/CT for oncology"].map(p => (
                <button key={p} onClick={() => navigate({ to: "/assistant", search: { q: p } as never })} className="chip hover:chip-accent">{p}</button>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Photon-counting CT", "1.5T MRI", "Tomosynthesis", "Helium-free", "AIR Recon DL"].map(p => (
                <button key={p} onClick={() => { setQ(p); navigate({ to: "/explore", search: { q: p } as never }); }} className="chip hover:chip-accent">{p}</button>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* AI recommendations */}
      <section className="mt-6">
        <SectionHeader title="AI Recommendations" subtitle="Best fits inferred from common procurement scenarios." />
        <div className="grid md:grid-cols-3 gap-3">
          <RecCard title="Best MRI for oncology centre" device={oncologyMRI} reason="High AI-maturity 3T platforms with oncology + neuro fit." />
          <RecCard title="High-throughput CT for ER" device={erCT} reason="Optimised for trauma & emergency volume." />
          <RecCard title="Cost-efficient CT pick" device={cheapCT} reason="Low TCO with healthy throughput." />
        </div>
      </section>

      {/* Modality usage + Trend */}
      <section className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="panel-elevated p-4">
          <SectionHeader title="Fleet modality mix" subtitle="Catalog distribution · simulated" small icon={<Activity className="size-4 text-[var(--color-primary)]" />} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-popover-foreground)" }}
                  itemStyle={{ color: "var(--color-popover-foreground)" }}
                />
                <Pie data={modalityShare} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {modalityShare.map((m, i) => <Cell key={i} fill={m.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-2">
            {modalityShare.map(m => (
              <span key={m.name} className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: m.fill }} />{m.name} · {m.value}</span>
            ))}
          </div>
        </div>

        <div className="panel-elevated p-4 lg:col-span-2">
          <SectionHeader title="Industry trend snapshot" subtitle="AI maturity vs throughput · last 12 months · simulated" small icon={<LineChartIcon className="size-4 text-[var(--color-primary)]" />} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-popover-foreground)" }}
                  itemStyle={{ color: "var(--color-popover-foreground)" }}
                />
                <Area type="monotone" dataKey="AI" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Throughput" stroke="var(--color-info)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Vendor breakdown + feed */}
      <section className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="panel-elevated p-4 lg:col-span-2">
          <SectionHeader title="OEM footprint" subtitle="Demo catalog · indexed devices per supplier (industry model)" small />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorBars} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-popover-foreground)" }}
                  itemStyle={{ color: "var(--color-popover-foreground)" }}
                />
                <Bar dataKey="devices" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel-elevated p-4">
          <SectionHeader title="Vendor activity" subtitle="Live feed · simulated" small />
          <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1">
            {VENDOR_FEED.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-2.5 hover:border-primary/30 transition">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.vendor} · {f.time}</div>
                <div className="text-xs mt-0.5">{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({ title, subtitle, small, icon }: { title: string; subtitle?: string; small?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className={`${small ? "text-sm" : "text-base"} font-semibold tracking-tight`}>{title}</div>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function RecCard({ title, device, reason }: { title: string; device?: ReturnType<typeof rankDevices>[number]["device"]; reason: string }) {
  if (!device) return null;
  return (
    <Link to="/devices/$deviceId" params={{ deviceId: device.id }} className="panel-elevated p-4 hover:border-primary/40 transition group block min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1 text-sm font-semibold truncate">{device.name}</div>
        <ConfidenceBadge value={device.confidence} />
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{device.vendor} · {device.modality}</div>
      <div className="text-xs mt-2">{reason}</div>
      <div className="mt-3 text-[11px] text-[var(--color-primary)] inline-flex items-center gap-1 group-hover:gap-2 transition">Explore <ArrowRight className="size-3" /></div>
    </Link>
  );
}

function RightRail() {
  const { recentDeviceIds, savedDevices, comparisonIds } = useAtlas();
  const recent = recentDeviceIds.map(id => DEVICES.find(d => d.id === id)).filter(Boolean);
  const saved = savedDevices.map(id => DEVICES.find(d => d.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-panel p-4">
        <div className="text-xs font-semibold flex items-center gap-1.5"><Sparkles className="size-3.5 text-[var(--color-primary)]" /> Atlas Co-pilot</div>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
          Press <kbd className="text-mono px-1 rounded bg-[var(--color-secondary)] border border-border">/</kbd> to search and <kbd className="text-mono px-1 rounded bg-[var(--color-secondary)] border border-border">⇧A</kbd> to ask AI. Refine further on Device Explorer with filters.
        </p>
      </div>

      <div className="panel-elevated p-3">
        <div className="text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Activity className="size-3.5 text-[var(--color-primary)]" /> Recently viewed</span>
          {recent.length > 0 && <span className="chip">{recent.length}</span>}
        </div>
        {recent.length === 0 ? (
          <div className="text-[11px] text-muted-foreground mt-2">Open any device to see it here.</div>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {recent.slice(0, 6).map(d => d && (
              <li key={d.id}>
                <Link to="/devices/$deviceId" params={{ deviceId: d.id }} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--color-secondary)]/60 text-xs">
                  <span className="chip">{d.modality}</span>
                  <span className="truncate flex-1">{d.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-elevated p-3">
        <div className="text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Bookmark className="size-3.5 text-[var(--color-primary)]" /> Saved</span>
          {saved.length > 0 && <Link to="/saved" className="chip chip-accent">Open</Link>}
        </div>
        {saved.length === 0 ? (
          <div className="text-[11px] text-muted-foreground mt-2">Bookmark devices to find them here later.</div>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {saved.slice(0, 5).map(d => d && (
              <li key={d.id}>
                <Link to="/devices/$deviceId" params={{ deviceId: d.id }} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--color-secondary)]/60 text-xs">
                  <span className="chip">{d.modality}</span>
                  <span className="truncate flex-1">{d.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {comparisonIds.length > 0 && (
        <Link to="/compare" className="glass-panel p-3 flex items-center justify-between hover:border-primary/40">
          <span className="text-xs font-semibold flex items-center gap-1.5"><GitCompare className="size-3.5 text-[var(--color-primary)]" /> {comparisonIds.length} in comparison</span>
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
