import { Link } from "@tanstack/react-router";
import { Bookmark, GitCompare, Sparkles, Cpu, Gauge, Zap, Radio, Activity, Scan, Atom } from "lucide-react";
import type { Modality } from "@/lib/atlas/types";

const MOD_ICON: Record<Modality, typeof Cpu> = {
  "MRI": Cpu, "CT": Zap, "X-ray": Radio, "Ultrasound": Activity, "Mammography": Scan, "PET/CT": Atom,
};
import { motion } from "framer-motion";
import type { Device } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

export function ConfidenceBadge({ value }: { value: number }) {
  const label = value >= 90 ? "High" : value >= 75 ? "Medium" : "Low";
  return (
    <span className="chip" title={`Confidence ${value}%`}>
      <span className="size-1.5 rounded-full bg-[var(--color-success)]" /> Confidence {label} · {value}%
    </span>
  );
}

export function DeviceCard({ device }: { device: Device }) {
  const { savedDevices, toggleSaved, comparisonIds, toggleCompare } = useAtlas();
  const saved = savedDevices.includes(device.id);
  const inCompare = comparisonIds.includes(device.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="panel-elevated p-4 flex flex-col gap-3 hover:border-primary/40 transition group"
    >
      <div className="flex items-start gap-3">
        <div className="size-12 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-secondary)] grid place-items-center border border-border">
          {(() => { const I = MOD_ICON[device.modality] ?? Cpu; return <I className="size-5 text-[var(--color-primary)]" />; })()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="chip">{device.modality}</span>
            <span>{device.vendor}</span>
            <span>·</span>
            <span>{device.releaseYear}</span>
          </div>
          <Link to="/devices/$deviceId" params={{ deviceId: device.id }} className="block mt-1 font-semibold tracking-tight hover:text-[var(--color-primary)]">
            {device.name}
          </Link>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{device.tagline}</p>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Stat label={device.modality === "MRI" ? "Field" : device.modality === "CT" || device.modality === "PET/CT" ? "Slices" : "Vendor"} value={device.modality === "MRI" ? `${device.fieldStrengthT}T` : (device.modality === "CT" || device.modality === "PET/CT") ? `${device.sliceCount ?? "—"}` : device.budgetTier} />
        <Stat label="Throughput" value={`${device.throughputPerDay}/d`} />
        <Stat label="AI" value={`${device.aiMaturity}/5`} />
      </div>

      <div className="flex flex-wrap gap-1">
        {device.clinicalTags.slice(0, 4).map(t => <span key={t} className="chip">{t}</span>)}
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
        <ConfidenceBadge value={device.confidence} />
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSaved(device.id)}
            className={`size-8 grid place-items-center rounded-md border border-border hover:border-primary/40 ${saved ? "text-[var(--color-primary)]" : "text-muted-foreground"}`}
            title="Save"
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={() => toggleCompare(device.id)}
            className={`size-8 grid place-items-center rounded-md border border-border hover:border-primary/40 ${inCompare ? "text-[var(--color-primary)]" : "text-muted-foreground"}`}
            title="Add to compare"
          >
            <GitCompare className="size-4" />
          </button>
          <Link
            to="/assistant"
            className="size-8 grid place-items-center rounded-md border border-border hover:border-primary/40 text-muted-foreground"
            title="Ask AI"
          >
            <Sparkles className="size-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-secondary)]/40 border border-border px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Gauge className="size-2.5" />{label}</div>
      <div className="text-sm font-semibold text-mono">{value}</div>
    </div>
  );
}
