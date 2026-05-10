import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Layers, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { DEVICES } from "@/lib/atlas/data";
import type { Modality } from "@/lib/atlas/types";
import { JourneyDisclaimer } from "@/components/journey/JourneyDisclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey/")({
  component: JourneyPicker,
});

const MODS: Modality[] = ["MRI", "CT", "X-ray", "Ultrasound", "Mammography", "PET/CT"];

function JourneyPicker() {
  const [q, setQ] = useState("");
  const [modality, setModality] = useState<Modality | "All">("All");

  const devices = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DEVICES.filter((d) => modality === "All" || d.modality === modality).filter(
      (d) => !term || d.name.toLowerCase().includes(term) || d.vendor.toLowerCase().includes(term),
    );
  }, [q, modality]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="chip chip-accent mb-2">
            <GraduationCap className="size-3" /> Reference
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Machine Journey</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Choose a system for a concise <strong>who’s involved</strong>, <strong>how it gets installed</strong>, <strong>how it’s used clinically</strong>, and{" "}
            <strong>what the images & data look like</strong> — no lessons or tests, just structured context.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-[var(--color-primary)]" />
          Educational overview — not clinical advice.
        </div>
      </header>

      <section className="glass-panel p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by device or vendor…"
              className="h-9 w-full rounded-md border border-border bg-[var(--color-input)] pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...MODS] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModality(m)}
                className={cn(
                  "h-8 rounded-md border px-3 text-xs transition",
                  modality === m
                    ? "border-primary/50 bg-[var(--color-accent)]/60 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {devices.map((d) => (
          <Link
            key={d.id}
            to="/journey/$deviceId"
            params={{ deviceId: d.id }}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-[var(--color-surface)]/60 p-4 transition hover:border-primary/40"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{d.modality}</span>
              <Layers className="size-3 text-[var(--color-primary)] opacity-70" />
            </div>
            <div className="text-sm font-semibold leading-tight">{d.name}</div>
            <div className="text-[11px] text-muted-foreground">{d.vendor}</div>
            <p className="line-clamp-2 text-xs text-muted-foreground">{d.tagline}</p>
            <span className="mt-auto pt-2 text-[11px] font-medium text-[var(--color-primary)]">Open overview →</span>
          </Link>
        ))}
        {devices.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No machines match those filters.
          </div>
        )}
      </section>

      <JourneyDisclaimer />
    </div>
  );
}
