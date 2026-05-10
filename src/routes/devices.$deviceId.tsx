import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Calculator, ChevronLeft, GitCompare, Share2, Sparkles, ShieldCheck, Cpu, Zap, Activity } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/atlas/AppShell";
import { getDevice } from "@/lib/atlas/data";
import { useAiPanelUi } from "@/lib/atlas/ai-panel-context";
import { useAtlas } from "@/lib/atlas/store";
import { toast } from "sonner";

export const Route = createFileRoute("/devices/$deviceId")({
  component: DeviceDetail,
});

const SECTION_NAV = [
  { id: "overview", label: "Overview" },
  { id: "clinical", label: "Clinical" },
  { id: "operational", label: "Operational" },
  { id: "financial", label: "Financial" },
  { id: "ai-features", label: "AI Features" },
  { id: "technical", label: "Technical" },
  { id: "compatibility", label: "Compatibility" },
] as const;

function DeviceDetail() {
  const { deviceId } = Route.useParams();
  const device = getDevice(deviceId);
  const { queueAndOpen } = useAiPanelUi();
  const { savedDevices, toggleSaved, comparisonIds, toggleCompare, pushRecent } = useAtlas();
  const navigate = useNavigate();

  useEffect(() => { if (device) pushRecent(device.id); }, [device, pushRecent]);

  if (!device) {
    return (
      <AppShell>
        <div className="panel-elevated p-10 text-center">
          <p className="text-sm">Device not found.</p>
          <Link to="/explore" search={{ q: "" }} className="mt-4 inline-flex chip chip-accent">Back to Explore</Link>
        </div>
      </AppShell>
    );
  }

  const saved = savedDevices.includes(device.id);
  const inCompare = comparisonIds.includes(device.id);
  const Icon = device.modality === "MRI" ? Cpu : Zap;

  return (
    <AppShell>
      <button type="button" onClick={() => navigate({ to: "/explore", search: { q: "" } })} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"><ChevronLeft className="size-3.5" /> Explore</button>

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 lg:p-7">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="size-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-info)]/10 grid place-items-center border border-border">
            <Icon className="size-7 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="chip">{device.modality}</span>
              <span>{device.vendor}</span><span>·</span>
              <span>{device.releaseYear}</span><span>·</span>
              <span>{device.budgetTier} tier</span>
            </div>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold tracking-tight">{device.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{device.tagline}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => toast.message("Share", { description: "Preview control — not wired in this prototype." })}
              className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="size-4" /> Share
            </button>
            <button onClick={() => toggleSaved(device.id)} className={`h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 ${saved ? "text-[var(--color-primary)] border-primary/40" : "text-muted-foreground hover:text-foreground"}`}>
              <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
            </button>
            <button onClick={() => toggleCompare(device.id)} className={`h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 ${inCompare ? "text-[var(--color-primary)] border-primary/40" : "text-muted-foreground hover:text-foreground"}`}>
              <GitCompare className="size-4" /> {inCompare ? "In Compare" : "Compare"}
            </button>
            <Link
              to="/roi"
              search={{ device: device.id }}
              className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Calculator className="size-4" /> ROI
            </Link>
            <button
              type="button"
              onClick={() => queueAndOpen(`Summarize ${device.name} (${device.vendor}) for procurement — key tradeoffs and fit`)}
              className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5"
            >
              <Sparkles className="size-4" /> Ask AI
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <HeroStat label={device.modality === "MRI" ? "Field strength" : "Slices"} value={device.modality === "MRI" ? `${device.fieldStrengthT}T` : `${device.sliceCount}`} />
          <HeroStat label="Throughput" value={`${device.throughputPerDay} / day`} />
          <HeroStat label="Est. capex" value={`$${device.estCostUSDm.toFixed(2)}M`} />
          <HeroStat label="ROI window" value={`~${device.roiYears} yrs`} />
        </div>
      </motion.section>

      {/* In-page jumps — all sections render below; scroll the page */}
      <nav className="mt-4 flex gap-1.5 overflow-x-auto pb-1" aria-label="On this page">
        {SECTION_NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 h-8 px-3 rounded-md border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-[var(--color-secondary)]/40 transition"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-8">
        <DeviceSection id="overview" title="Overview">
          <OverviewTab device={device} />
        </DeviceSection>

        <DeviceSection id="clinical" title="Clinical suitability">
          <div className="panel-elevated p-5">
            <div className="text-sm font-semibold">Clinical tags</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {device.clinicalTags.map(t => <span key={t} className="chip">{t}</span>)}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Atlas tags reflect typical procurement positioning. Always validate against clinical workflow.</p>
          </div>
        </DeviceSection>

        <DeviceSection id="operational" title="Operational metrics">
          <KVList items={[
            ["Throughput", `${device.throughputPerDay} exams/day`],
            ["Uptime", `${device.uptimePct}%`],
            ["Setup", `${device.setupWeeks} weeks`],
            ["Operational complexity", device.complexity],
            ["Maintenance burden", `${device.maintenanceBurden}/5`],
          ]} />
        </DeviceSection>

        <DeviceSection id="financial" title="Financial metrics">
          <KVList items={[
            ["Estimated capital cost", `$${device.estCostUSDm.toFixed(2)}M`],
            ["Cost per scan", `$${device.costPerScanUSD}`],
            ["ROI window", `~${device.roiYears} yrs`],
            ["Budget tier", device.budgetTier],
          ]} />
        </DeviceSection>

        <DeviceSection id="ai-features" title="AI features">
          <div className="panel-elevated p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">AI capabilities</div>
              <span className="chip">Maturity {device.aiMaturity}/5</span>
            </div>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2">
              {device.aiCapabilities.map(c => (
                <li key={c} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center gap-2"><Sparkles className="size-3.5 text-[var(--color-primary)]" />{c}</div>
                </li>
              ))}
            </ul>
          </div>
        </DeviceSection>

        <DeviceSection id="technical" title="Technical specs">
          <KVList items={[
            ["Modality", device.modality],
            ["Vendor", device.vendor],
            ["Release year", String(device.releaseYear)],
            ...(device.modality === "MRI"
              ? [["Field strength", `${device.fieldStrengthT}T`], ["Bore", `${device.boreCm} cm`], ["Gradient strength", `${device.gradientStrength} mT/m`]] as [string, string][]
              : [["Slices", String(device.sliceCount)], ["Detector rows", String(device.detectorRows)], ["Rotation time", `${device.rotationTimeS} s`]] as [string, string][]),
            ["Power draw", `${device.powerKW} kW`],
          ]} />
        </DeviceSection>

        <DeviceSection id="compatibility" title="Compatibility">
          <div className="panel-elevated p-5">
            <div className="text-sm font-semibold">Standards &amp; integration</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {device.standards.map(s => <span key={s} className="chip chip-accent">{s}</span>)}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="size-3.5 mt-0.5 shrink-0" />
              Integration notes are planning-grade only. Verify with vendor before procurement decisions.
            </p>
          </div>
        </DeviceSection>
      </div>
    </AppShell>
  );
}

function DeviceSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[calc(3.5rem+1rem)]">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-mono mt-0.5">{value}</div>
    </div>
  );
}

function KVList({ items }: { items: [string, string][] }) {
  return (
    <div className="panel-elevated divide-y divide-border">
      {items.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="font-medium text-mono">{v}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ device }: { device: ReturnType<typeof getDevice> & {} }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="panel-elevated p-5">
        <div className="text-sm font-semibold flex items-center gap-2"><Activity className="size-4 text-[var(--color-primary)]" /> Headline value</div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{device.tagline}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Mini label="AI Maturity" value={`${device.aiMaturity}/5`} />
          <Mini label="Uptime" value={`${device.uptimePct}%`} />
          <Mini label="Complexity" value={device.complexity} />
          <Mini label="Maint. burden" value={`${device.maintenanceBurden}/5`} />
        </div>
      </div>
      <div className="panel-elevated p-5">
        <div className="text-sm font-semibold">Best-fit scenarios</div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {device.clinicalTags.map(t => (
            <li key={t} className="rounded-md border border-border px-3 py-2 flex items-center justify-between">
              <span className="capitalize">{t}</span>
              <span className="chip chip-accent">recommended</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-mono">{value}</div>
    </div>
  );
}

