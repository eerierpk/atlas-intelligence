import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bookmark, GitCompare, Sparkles, Cpu, Gauge, Zap, Radio, Activity, Scan, Atom } from "lucide-react";
import type { Device, Modality } from "@/lib/atlas/types";
import { useAiPanelUi } from "@/lib/atlas/ai-panel-context";
import { useAtlas } from "@/lib/atlas/store";
import { cn } from "@/lib/utils";

const MOD_ICON: Record<Modality, typeof Cpu> = {
  "MRI": Cpu, "CT": Zap, "X-ray": Radio, "Ultrasound": Activity, "Mammography": Scan, "PET/CT": Atom,
};

export function ConfidenceBadge({ value, className }: { value: number; className?: string }) {
  const label = value >= 90 ? "High" : value >= 75 ? "Medium" : "Low";
  return (
    <span
      className={cn(
        "chip inline-flex min-w-0 max-w-full shrink items-center gap-1 overflow-hidden",
        className,
      )}
      title={`Confidence ${value}%`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-success)]" />
      <span className="min-w-0 flex-1 truncate">{`Confidence ${label} · ${value}%`}</span>
    </span>
  );
}

export function DeviceCard({ device }: { device: Device }) {
  const { queueAndOpen } = useAiPanelUi();
  const { savedDevices, toggleSaved, comparisonIds, toggleCompare } = useAtlas();
  const saved = savedDevices.includes(device.id);
  const inCompare = comparisonIds.includes(device.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="panel-elevated p-4 flex min-w-0 w-full flex-col gap-3 hover:border-primary/40 transition group"
    >
      <div className="flex items-start gap-3">
        <div className="size-12 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-secondary)] grid place-items-center border border-border">
          {(() => { const I = MOD_ICON[device.modality] ?? Cpu; return <I className="size-5 text-[var(--color-primary)]" />; })()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
            <span className="chip shrink-0">{device.modality}</span>
            <span className="min-w-0 truncate" title={`${device.vendor} · ${device.releaseYear}`}>
              {device.vendor} · {device.releaseYear}
            </span>
          </div>
          <Link
            to="/devices/$deviceId"
            params={{ deviceId: device.id }}
            className="mt-1 block min-w-0 break-words font-semibold leading-snug tracking-tight hover:text-[var(--color-primary)]"
          >
            {device.name}
          </Link>
        </div>
      </div>

      <p className="min-w-0 text-xs leading-relaxed text-muted-foreground line-clamp-2">{device.tagline}</p>

      <div className="grid min-w-0 grid-cols-3 gap-2 text-[11px]">
        <Stat label={device.modality === "MRI" ? "Field" : device.modality === "CT" || device.modality === "PET/CT" ? "Slices" : "Vendor"} value={device.modality === "MRI" ? `${device.fieldStrengthT}T` : (device.modality === "CT" || device.modality === "PET/CT") ? `${device.sliceCount ?? "—"}` : device.budgetTier} />
        <Stat label="Throughput" value={`${device.throughputPerDay}/d`} />
        <Stat label="AI" value={`${device.aiMaturity}/5`} />
      </div>

      <div className="flex flex-wrap gap-1">
        {device.clinicalTags.slice(0, 4).map(t => <span key={t} className="chip">{t}</span>)}
      </div>

      <div className="mt-1 flex min-w-0 flex-col gap-2 border-t border-border pt-3">
        <ConfidenceBadge value={device.confidence} className="self-start max-w-full" />
        <div className="flex shrink-0 items-center justify-end gap-1">
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
          <button
            type="button"
            onClick={() => queueAndOpen(`Summarize ${device.name} (${device.vendor}) for procurement`)}
            className="size-8 grid place-items-center rounded-md border border-border hover:border-primary/40 text-muted-foreground"
            title="Ask AI"
          >
            <Sparkles className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-[var(--color-secondary)]/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        <Gauge className="size-2.5 shrink-0" />
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="truncate text-sm font-semibold text-mono" title={value}>
        {value}
      </div>
    </div>
  );
}
