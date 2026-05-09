import { createFileRoute } from "@tanstack/react-router";
import { Bot, Activity, CheckCircle2, AlertTriangle, Clock, ChevronRight, Database, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { AGENTS } from "@/lib/atlas/agents";
import type { Agent } from "@/lib/atlas/types";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
});

function statusChip(s: Agent["status"]) {
  if (s === "running") return <span className="chip chip-accent"><Activity className="size-3" /> Running</span>;
  if (s === "needs-review") return <span className="chip chip-warn"><AlertTriangle className="size-3" /> Needs review</span>;
  return <span className="chip"><Clock className="size-3" /> Idle</span>;
}

function AgentsPage() {
  const [activeId, setActiveId] = useState<string>(AGENTS[0].id);
  const active = AGENTS.find(a => a.id === activeId)!;

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Bot className="size-6 text-[var(--color-primary)]" /> Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous workers that enrich the Atlas decision trail. <span className="chip ml-2"><Sparkles className="size-3" /> Simulated</span></p>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[320px_1fr] gap-4">
        {/* Agent list */}
        <div className="flex flex-col gap-2">
          {AGENTS.map(a => {
            const isActive = a.id === activeId;
            return (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className={`text-left panel p-3 hover:border-primary/40 transition ${isActive ? "border-primary/50 bg-[var(--color-accent)]/30" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-md bg-[var(--color-secondary)] grid place-items-center shrink-0"><Bot className="size-4 text-[var(--color-primary)]" /></div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">Last run · {a.lastRun}</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {statusChip(a.status)}
                  <span className="text-[11px] text-muted-foreground text-mono">conf {a.confidence}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">{active.name}</h2>
                  {statusChip(active.status)}
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{active.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-accent">Confidence {active.confidence}%</span>
                <button className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5"><Activity className="size-4" /> Trigger run</button>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              <Stat label="Tasks complete" value={String(active.tasks.filter(t => t.state === "done").length)} />
              <Stat label="In flight" value={String(active.tasks.filter(t => t.state !== "done").length)} />
              <Stat label="Data sources" value={String(active.dataSources.length)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="panel-elevated p-4">
              <div className="text-sm font-semibold flex items-center gap-2"><Activity className="size-4 text-[var(--color-primary)]" /> Task queue</div>
              <ul className="mt-3 flex flex-col gap-2">
                {active.tasks.map(t => (
                  <li key={t.id} className="rounded-md border border-border p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-[11px] text-muted-foreground">{t.ts}</div>
                    </div>
                    {t.state === "done" ? <span className="chip chip-success"><CheckCircle2 className="size-3" /> done</span>
                      : t.state === "running" ? <span className="chip chip-accent"><Activity className="size-3" /> running</span>
                      : <span className="chip"><Clock className="size-3" /> queued</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-elevated p-4">
              <div className="text-sm font-semibold flex items-center gap-2"><Database className="size-4 text-[var(--color-primary)]" /> Data sources</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {active.dataSources.map(s => <span key={s} className="chip">{s}</span>)}
              </div>
              <div className="text-sm font-semibold mt-5 flex items-center gap-2"><Sparkles className="size-4 text-[var(--color-primary)]" /> Decision log <span className="chip">deterministic mock</span></div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[12px]">
                {active.logs.map((l, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-mono text-muted-foreground w-12 shrink-0">{l.ts}</span>
                    <span className={`uppercase text-[10px] tracking-wider w-10 shrink-0 ${l.level === "ok" ? "text-[var(--color-success)]" : l.level === "warn" ? "text-[var(--color-warning)]" : "text-muted-foreground"}`}>{l.level}</span>
                    <span className="text-muted-foreground">{l.msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-6">LLM-assisted extraction is simulated for demo. AI-generated guidance, not medical advice.</p>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-mono mt-0.5">{value}</div>
    </div>
  );
}
