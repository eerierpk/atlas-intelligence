import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Film, ImageIcon, Info, ListChecks, Play, Stethoscope, X } from "lucide-react";
import { SearchableCombobox, type ComboOption } from "@/components/ui/searchable-combobox";
import { getScenariosForModality, type Scenario } from "@/lib/fixtures/scenarios";
import type { Modality } from "@/lib/atlas/types";

export function ScenarioBreakdown({ modality }: { modality: Modality }) {
  const scenarios = getScenariosForModality(modality);
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0]?.id ?? "");

  useEffect(() => {
    const list = getScenariosForModality(modality);
    setScenarioId((prev) => (list.some((s) => s.id === prev) ? prev : list[0]?.id ?? ""));
  }, [modality]);

  const scenario = scenarios.find(s => s.id === scenarioId) ?? scenarios[0];
  const scenarioOptions: ComboOption[] = useMemo(
    () => scenarios.map(s => ({ value: s.id, label: s.name })),
    [scenarios]
  );

  if (!scenario) {
    return <div className="text-sm text-muted-foreground">No scenarios available for this modality yet.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Scenario</div>
            <div className="text-sm font-semibold mt-0.5">{scenario.name}</div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{scenario.shortDescription}</p>
          </div>
          <div className="flex flex-col gap-1 min-w-[14rem]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Choose scenario</span>
            <SearchableCombobox
              options={scenarioOptions}
              value={scenarioId}
              onChange={(v) => v && setScenarioId(v)}
              placeholder="Select scenario…"
              searchPlaceholder="Search scenarios…"
              triggerClassName="min-h-9 text-xs"
            />
          </div>
        </div>
        <p className="mt-3 text-[11px] text-foreground/90 leading-relaxed border border-border rounded-md px-3 py-2 bg-[var(--color-surface)]/50">
          <span className="font-medium text-[var(--color-primary)]">How to use this tab:</span>{" "}
          {scenario.readingFramework}
        </p>
        <p className="mt-2 text-[11px] text-amber-300/90 dark:text-amber-200/80 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
          Teaching scenario — not patient-specific. Educational / planning prototype. Not for clinical use.
        </p>
      </div>

      <Section icon={<Stethoscope className="size-4" />} title="Patient journey">
        <ol className="relative ml-3 border-l border-border space-y-3">
          {scenario.patientJourney.map((s, i) => (
            <li key={i} className="pl-4 relative">
              <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-background)]" />
              <div className="text-sm font-medium">{s.label}</div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={<ImageIcon className="size-4" />} title="What gets acquired">
        <div className="text-sm font-medium">{scenario.acquisition.name}</div>
        <p className="text-xs text-muted-foreground mt-1">{scenario.acquisition.description}</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {scenario.acquisition.figures.map(f => (
            <figure key={f.src} className="rounded-md border border-border overflow-hidden bg-[var(--color-background)]/40">
              <img src={f.src} alt={f.caption} className="w-full max-h-56 object-contain" loading="lazy" />
              <figcaption className="text-[11px] text-muted-foreground p-2 border-t border-border">{f.caption} · <span className="opacity-80">no real patient data</span></figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section icon={<Info className="size-4" />} title="Representative output & what to notice (educational)">
        <ImageGuide scenario={scenario} />
        <p className="text-[11px] text-muted-foreground mt-2">
          Hotspots describe how imaging data are read in teaching programs — not a diagnosis for any real study. Figures are schematics, not patient images.
        </p>
      </Section>

      <Section icon={<ListChecks className="size-4" />} title="What the scan encodes (typical vs example vs deviation)">
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--color-secondary)]/60">
              <tr>
                <Th>Metric</Th><Th>What it measures</Th><Th>Typical range</Th><Th>Example value</Th><Th>How to think about deviation</Th>
              </tr>
            </thead>
            <tbody>
              {scenario.metrics.map((m, i) => (
                <tr key={m.metric} className={i % 2 ? "bg-[var(--color-surface)]/30" : ""}>
                  <Td className="font-medium">{m.metric}</Td>
                  <Td className="text-muted-foreground">{m.measures}</Td>
                  <Td className="text-mono">{m.typicalRange}</Td>
                  <Td className="text-mono">{m.exampleValue}</Td>
                  <Td className="text-muted-foreground">{m.deviation}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          “Typical range” is educational background; “example value” is a fabricated teaching number. Any concern from a real exam belongs with the treating clinician and radiology team — not this demo.
        </p>
      </Section>

      <Section icon={<ListChecks className="size-4" />} title="Follow-up & communication (illustrative pathways)">
        <ul className="list-disc pl-5 text-sm space-y-1.5 marker:text-[var(--color-primary)]">
          {scenario.nextSteps.map(n => <li key={n} className="text-foreground/90">{n}</li>)}
        </ul>
      </Section>

      <Section icon={<Film className="size-4" />} title="Demo clip (simulated)">
        <SimulatedClip scenario={scenario} />
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-[var(--color-surface)]/40 p-4">
      <h3 className="text-sm font-semibold flex items-center gap-2"><span className="text-[var(--color-primary)]">{icon}</span> {title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th className="text-left px-3 py-2 font-medium text-muted-foreground border-b border-border">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-3 py-2 border-b border-border/60 align-top ${className}`}>{children}</td>; }

function ImageGuide({ scenario }: { scenario: Scenario }) {
  const [active, setActive] = useState<number | null>(null);
  const fig = scenario.imageGuide;
  return (
    <div className="rounded-md border border-border overflow-hidden bg-[var(--color-background)]/40">
      <div className="relative">
        <img src={fig.src} alt={fig.alt} className="w-full max-h-72 object-contain" loading="lazy" />
        {fig.hotspots.map((h, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)} onBlur={() => setActive(null)}
            style={{ left: `${h.xPct}%`, top: `${h.yPct}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-[var(--color-primary)]/80 border-2 border-[var(--color-background)] grid place-items-center text-[10px] font-bold text-[var(--color-primary-foreground)] hover:scale-110 transition"
            aria-label={h.label}
          >
            {i + 1}
          </button>
        ))}
        {active !== null && (
          <div className="absolute bottom-2 left-2 right-2 rounded-md bg-[var(--color-popover)]/95 border border-border p-2 text-xs">
            <div className="font-semibold">{fig.hotspots[active].label}</div>
            <div className="text-muted-foreground mt-0.5">{fig.hotspots[active].note}</div>
          </div>
        )}
      </div>
      <div className="text-[11px] text-muted-foreground p-2 border-t border-border">{fig.caption}</div>
    </div>
  );
}

function SimulatedClip({ scenario }: { scenario: Scenario }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const start = () => {
    setOpen(true); setStep(0);
    let i = 0;
    const tick = () => {
      i++;
      if (i >= scenario.videoCaptions.length) return;
      setStep(i);
      setTimeout(tick, 1100);
    };
    setTimeout(tick, 1100);
  };

  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
      <button onClick={start} className="relative rounded-md border border-border bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-background)] aspect-video grid place-items-center group hover:border-primary/50 transition">
        <Play className="size-7 text-[var(--color-primary)] group-hover:scale-110 transition" />
        <span className="absolute bottom-1 right-2 chip">10s demo</span>
      </button>
      <p className="text-xs text-muted-foreground">No real video is bundled. Press play to view a 10-second simulated walk-through with captions describing each acquisition step. Clearly labeled as a demo.</p>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg mx-4 glass-panel rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="text-sm font-semibold flex items-center gap-2"><Film className="size-4 text-[var(--color-primary)]" /> Simulated clip <span className="chip">demo only</span></div>
              <button onClick={() => setOpen(false)} className="size-7 grid place-items-center rounded-md border border-border"><X className="size-3.5" /></button>
            </div>
            <div className="aspect-video bg-[var(--color-background)] relative overflow-hidden">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 grid place-items-center"
              >
                <div className="text-center px-6">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {step + 1} / {scenario.videoCaptions.length}</div>
                  <div className="mt-2 text-sm font-medium">{scenario.videoCaptions[step]}</div>
                </div>
              </motion.div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-secondary)]">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${((step + 1) / scenario.videoCaptions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="p-3 text-[11px] text-muted-foreground">Animated placeholder — not a real recording.</div>
          </div>
        </div>
      )}
    </div>
  );
}
