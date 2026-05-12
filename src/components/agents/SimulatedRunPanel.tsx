import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Clock, Play, RotateCcw } from "lucide-react";

export interface RunStep {
  label: string;
  durationMs?: number;
}

export interface RunOutput {
  summary: string;
  bullets: string[];
  confidence: number; // 0-100
  sources: { label: string; url: string }[];
}

interface Props {
  status: "idle" | "running" | "needs-review" | "done";
  steps: RunStep[];
  /** Called when user presses Start */
  onStart: () => void;
  /** Called when user presses Reset */
  onReset: () => void;
  /** Output appears after the run completes */
  output?: RunOutput | null;
  /** Optional inputs panel (e.g. file picker, URL field) */
  inputs?: React.ReactNode;
  /** External controlled state machine — if provided, internal timer is skipped. */
  controlled?: boolean;
}

export function SimulatedRunPanel({ status, steps, onStart, onReset, output, inputs, controlled }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<{ ts: string; text: string }[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "running" || controlled) return;
    setActiveStep(0); setLogs([]);
    let i = 0;
    const tick = () => {
      const step = steps[i];
      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs(prev => [...prev, { ts, text: step.label }]);
      setActiveStep(i);
      i++;
      if (i < steps.length) {
        timer.current = window.setTimeout(tick, step.durationMs ?? 850);
      }
    };
    tick();
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [status, controlled, steps]);

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-4">
      <div className="panel-elevated p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-sm font-semibold flex items-center gap-2"><Activity className="size-4 text-[var(--color-primary)]" /> Job</div>
          <div className="flex items-center gap-1.5">
            <button
              type="button" onClick={onStart} disabled={status === "running"}
              className="h-8 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="size-3.5" /> {status === "running" ? "Running…" : "Start run"}
            </button>
            <button
              type="button" onClick={onReset}
              className="h-8 px-3 rounded-md border border-border text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
        </div>
        {inputs && <div className="mb-4">{inputs}</div>}

        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Steps</div>
        <ol className="space-y-2">
          {steps.map((s, i) => {
            const done = i < activeStep || status === "done";
            const running = status === "running" && i === activeStep;
            return (
              <li key={i} className="flex items-center gap-2 text-xs">
                {done ? <CheckCircle2 className="size-3.5 text-[var(--color-success)]" />
                  : running ? <span className="size-3.5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                  : <Clock className="size-3.5 text-muted-foreground" />}
                <span className={done ? "text-foreground" : running ? "text-foreground font-medium" : "text-muted-foreground"}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="panel-elevated p-4">
        <div className="text-sm font-semibold mb-2">Activity log</div>
        <div className="rounded-md border border-border bg-[var(--color-background)]/50 p-3 h-40 overflow-auto text-[11px] font-mono space-y-1">
          {logs.length === 0 && <div className="text-muted-foreground">— idle —</div>}
          {logs.map((l, i) => (
            <div key={i} className="flex gap-2"><span className="text-muted-foreground shrink-0">{l.ts}</span><span>{l.text}</span></div>
          ))}
        </div>

        <div className="text-sm font-semibold mt-4 mb-2">Output</div>
        {!output ? (
          <div className="text-xs text-muted-foreground">Run hasn't completed yet.</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-border p-3 bg-[var(--color-surface)]/60">
            <p className="text-xs leading-relaxed">{output.summary}</p>
            <ul className="mt-2 list-disc pl-5 text-xs space-y-1 marker:text-[var(--color-primary)]">
              {output.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                <span>Confidence (simulated)</span><span>{output.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-secondary)] overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${output.confidence}%` }} />
              </div>
              {output.confidence < 70 && (
                <div className="mt-2 text-[11px] text-[var(--color-warning)] flex items-center gap-1.5"><AlertTriangle className="size-3" /> Below threshold — flag for human review.</div>
              )}
            </div>
            {output.sources.length > 0 && (
              <div className="mt-3 text-[11px]">
                <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-1">Sources (simulated)</div>
                <ul className="space-y-0.5">
                  {output.sources.map((s, i) => (
                    <li key={i}><a className="text-[var(--color-primary)] underline-offset-2 hover:underline" href={s.url}>{s.label}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
