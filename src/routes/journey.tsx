import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, GraduationCap, History, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DEVICES } from "@/lib/atlas/data";
import type { Modality } from "@/lib/atlas/types";
import { JourneyDisclaimer } from "@/components/journey/JourneyDisclaimer";
import { curriculumFor, estimatedMinutes, totalLessons } from "@/lib/journey/curriculum";
import { pctComplete, readAllProgress, type DeviceProgress } from "@/lib/journey/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  component: JourneyPicker,
  head: () => ({
    meta: [
      { title: "Machine Journey — MedIntel Atlas" },
      { name: "description", content: "Guided learning: install, use, and integrate medical imaging equipment." },
    ],
  }),
});

const MODS: Modality[] = ["MRI", "CT", "X-ray", "Ultrasound", "Mammography", "PET/CT"];

function JourneyPicker() {
  const [q, setQ] = useState("");
  const [modality, setModality] = useState<Modality | "All">("All");
  const [progressMap, setProgressMap] = useState<Record<string, DeviceProgress>>({});

  useEffect(() => {
    const refresh = () => setProgressMap(readAllProgress());
    refresh();
    window.addEventListener("medintel:journey-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("medintel:journey-progress", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const devices = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DEVICES.filter((d) => modality === "All" || d.modality === modality).filter(
      (d) => !term || d.name.toLowerCase().includes(term) || d.vendor.toLowerCase().includes(term),
    );
  }, [q, modality]);

  const lastVisited = useMemo(() => {
    const entries = Object.entries(progressMap)
      .filter(([, p]) => p.completedLessons.length > 0 || p.lastLessonId)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .slice(0, 3)
      .map(([id, p]) => ({ device: DEVICES.find((d) => d.id === id), progress: p }))
      .filter((x) => !!x.device);
    return entries as { device: NonNullable<typeof entries[number]["device"]>; progress: DeviceProgress }[];
  }, [progressMap]);

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="chip chip-accent mb-2"><GraduationCap className="size-3" /> Learning module</div>
            <h1 className="text-2xl font-semibold tracking-tight">Machine Journey</h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1">
              Pick a machine, then walk through how to <strong>set it up</strong>, how to <strong>use it</strong>, and the <strong>hardware, software & ecosystem</strong> around it. Progress is saved on this device.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-[var(--color-primary)]" />
            Educational only — not clinical decision support.
          </div>
        </header>

        {lastVisited.length > 0 && (
          <section className="glass-panel p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
              <History className="size-3.5" /> Resume
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lastVisited.map(({ device, progress }) => {
                const total = totalLessons(curriculumFor(device.modality));
                const pct = pctComplete(progress, total);
                return (
                  <Link
                    key={device.id}
                    to="/journey/$deviceId"
                    params={{ deviceId: device.id }}
                    className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-3 hover:border-primary/40 transition"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{device.modality} · {device.vendor}</div>
                    <div className="text-sm font-semibold mt-0.5 truncate">{device.name}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-[var(--color-secondary)]/60 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{pct}% complete · {progress.completedLessons.length}/{total} lessons</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="glass-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by device or vendor…"
                className="w-full h-9 pl-9 pr-3 rounded-md bg-[var(--color-input)] border border-border text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...MODS] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModality(m)}
                  className={cn(
                    "h-8 px-3 rounded-md border text-xs transition",
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
          {devices.map((d) => {
            const c = curriculumFor(d.modality);
            const mins = estimatedMinutes(c);
            const total = totalLessons(c);
            const p = progressMap[d.id];
            const pct = pctComplete(p, total);
            return (
              <Link
                key={d.id}
                to="/journey/$deviceId"
                params={{ deviceId: d.id }}
                className="group rounded-lg border border-border bg-[var(--color-surface)]/60 p-4 hover:border-primary/40 transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>{d.modality}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {mins} min</span>
                </div>
                <div className="text-sm font-semibold leading-tight">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">{d.vendor}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{d.tagline}</p>
                <div className="mt-auto pt-2">
                  <div className="h-1.5 rounded-full bg-[var(--color-secondary)]/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span>{total} lessons</span>
                    <span>{pct === 0 ? "Start" : pct === 100 ? "Complete" : `${pct}%`}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {devices.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground p-6 text-center border border-dashed border-border rounded-lg">
              No machines match those filters.
            </div>
          )}
        </section>

        <JourneyDisclaimer />
      </div>
    </AppShell>
  );
}
