import { createFileRoute } from "@tanstack/react-router";
import { Bot, FileText, GitBranch, Globe2, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DocumentIngestAgent } from "@/components/agents/DocumentIngestAgent";
import { IntelExpertAgent } from "@/components/agents/IntelExpertAgent";
import { PublicScoutAgent } from "@/components/agents/PublicScoutAgent";
import { useAtlas } from "@/lib/atlas/store";
import { can } from "@/lib/atlas/permissions";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
});

type AgentKey = "ingest" | "expert" | "scout";

const AGENTS: { key: AgentKey; name: string; purpose: string; icon: React.ComponentType<{ className?: string }>; expertOnly?: boolean }[] = [
  { key: "ingest", name: "Document / video ingest", purpose: "Simulated extraction of summaries from PDFs, transcripts, and public links.", icon: FileText },
  { key: "expert", name: "Intel Expert", purpose: "Human-in-the-loop content review — propose, accept, reject, version edits to the catalog.", icon: GitBranch, expertOnly: true },
  { key: "scout",  name: "Public web scout", purpose: "Simulated competitor scouting from public sources, scoped by device and region.", icon: Globe2 },
];

function AgentsPage() {
  const { user } = useAtlas();
  const role = user?.userRole;
  const [active, setActive] = useState<AgentKey>("ingest");

  const a = AGENTS.find(x => x.key === active)!;
  const expertLocked = a.expertOnly && !can(role, "approve:content");

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Bot className="size-6 text-[var(--color-primary)]" /> Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Three simulated workers. Multi-step runs with logs and reset. <span className="chip ml-2"><Sparkles className="size-3" /> Simulated</span></p>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-2">
          {AGENTS.map(x => {
            const isActive = x.key === active;
            const locked = x.expertOnly && !can(role, "approve:content");
            return (
              <button
                key={x.key}
                onClick={() => setActive(x.key)}
                className={`text-left panel p-3 hover:border-primary/40 transition ${isActive ? "border-primary/50 bg-[var(--color-accent)]/30" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-md bg-[var(--color-secondary)] grid place-items-center shrink-0">
                    <x.icon className="size-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate flex items-center gap-1.5">{x.name} {locked && <Lock className="size-3 text-muted-foreground" />}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">{x.purpose}</div>
                  </div>
                </div>
              </button>
            );
          })}
          <p className="text-[10px] text-muted-foreground mt-2">Educational / procurement planning prototype. Not for clinical use.</p>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-base font-semibold flex items-center gap-2"><a.icon className="size-4 text-[var(--color-primary)]" /> {a.name}</div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{a.purpose}</p>
              </div>
              {a.expertOnly && (
                <span className={`chip ${can(role, "approve:content") ? "chip-accent" : ""}`}>
                  Expert role required {can(role, "approve:content") ? "· unlocked" : "· locked"}
                </span>
              )}
            </div>
          </div>

          {active === "ingest" && <DocumentIngestAgent />}
          {active === "expert" && <IntelExpertAgent readOnly={expertLocked} />}
          {active === "scout"  && <PublicScoutAgent />}
        </div>
      </div>
    </AppShell>
  );
}
