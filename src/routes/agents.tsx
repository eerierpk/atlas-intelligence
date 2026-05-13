import { createFileRoute } from "@tanstack/react-router";
import { Bot, FileText, GitBranch, Globe2, Lock, Sparkles, MessageSquare, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DocumentIngestAgent } from "@/components/agents/DocumentIngestAgent";
import { IntelExpertAgent } from "@/components/agents/IntelExpertAgent";
import { PublicScoutAgent } from "@/components/agents/PublicScoutAgent";
import { useAiPanelUi, type AgentId } from "@/lib/atlas/ai-panel-context";
import { useAtlas } from "@/lib/atlas/store";
import { can } from "@/lib/atlas/permissions";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
});

type LauncherKey = "ask-atlas" | "ingest" | "expert" | "scout";

const LAUNCHERS: {
  id: LauncherKey; name: string; purpose: string; icon: React.ComponentType<{ className?: string }>;
  expertOnly?: boolean; starter: string;
}[] = [
  { id: "ask-atlas", name: "Ask Atlas", purpose: "General Q&A, catalog queries, navigation, scenario reasoning.", icon: Sparkles, starter: "Best MRI for neuro + oncology with moderate budget" },
  { id: "ingest", name: "Document / video ingest", purpose: "Simulated extraction of summaries from PDFs, transcripts, and public links.", icon: FileText, starter: "Summarize the key claims from spec-sheet.pdf" },
  { id: "expert", name: "Intel Expert", purpose: "Human-in-the-loop catalog review — propose, accept, reject, version edits.", icon: GitBranch, expertOnly: true, starter: "Draft an updated tagline for the Magnetom Vida" },
  { id: "scout", name: "Public web scout", purpose: "Simulated competitor scouting from public sources, scoped by device and region.", icon: Globe2, starter: "Find competitors to GE Revolution Apex CT in EU" },
];

const TO_PANEL_ID: Record<LauncherKey, AgentId> = {
  "ask-atlas": "ask-atlas",
  ingest: "ingest",
  scout: "scout",
  expert: "intel-expert",
};

function AgentsPage() {
  const { user } = useAtlas();
  const role = user?.userRole;
  const { queueAndOpen } = useAiPanelUi();
  const [showDetailed, setShowDetailed] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Bot className="size-6 text-[var(--color-primary)]" /> Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Launch a chat-first agent or open a detailed simulation. <span className="chip ml-2"><Sparkles className="size-3" /> Simulated</span></p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-2 min-w-0">
        {LAUNCHERS.map(a => {
          const panelId = TO_PANEL_ID[a.id];
          const locked = a.expertOnly && !can(role, "approve:content");
          return (
            <div key={a.id as string} className="glass-panel p-4 flex flex-col gap-3 min-w-0">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-md bg-[var(--color-accent)]/60 grid place-items-center shrink-0">
                  <a.icon className="size-5 text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5 truncate">{a.name} {locked && <Lock className="size-3 text-muted-foreground" />}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{a.purpose}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => queueAndOpen(undefined, panelId)}
                  className="h-10 min-h-11 sm:min-h-10 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium flex items-center gap-1.5"
                >
                  <MessageSquare className="size-3.5" /> Open chat
                </button>
                <button
                  onClick={() => queueAndOpen(a.starter, panelId)}
                  className="h-10 min-h-11 sm:min-h-10 px-3 rounded-md border border-border hover:border-primary/40 text-xs flex items-center gap-1.5"
                >
                  Try starter
                </button>
                {a.id !== "ask-atlas" && (
                  <button
                    onClick={() => setShowDetailed(s => s === a.id ? null : (a.id as string))}
                    className="h-10 min-h-11 sm:min-h-10 px-3 rounded-md border border-border hover:border-primary/40 text-xs flex items-center gap-1.5"
                  >
                    Detailed simulation <ChevronDown className={`size-3.5 transition-transform ${showDetailed === a.id ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {a.expertOnly && (
                <span className={`chip text-[10px] ${can(role, "approve:content") ? "chip-accent" : ""}`}>
                  Expert role required {can(role, "approve:content") ? "· unlocked" : "· locked"}
                </span>
              )}
              {showDetailed === a.id && (
                <div className="mt-2 border-t border-border pt-3 motion-safe:animate-in motion-safe:fade-in">
                  {a.id === "ingest" && <DocumentIngestAgent />}
                  {a.id === "expert" && <IntelExpertAgent readOnly={Boolean(locked)} />}
                  {a.id === "scout" && <PublicScoutAgent />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-6">Educational / procurement planning prototype. Not for clinical use. Each agent maintains its own chat thread in the Ask AI panel.</p>
    </AppShell>
  );
}
