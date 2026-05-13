import { createFileRoute } from "@tanstack/react-router";
import { Bot, FileText, GitBranch, Globe2, Lock, MessageSquare, Search, Sparkles, X, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(
    () => LAUNCHERS.filter(a =>
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery]
  );

  const focusedLauncher = focusedAgent ? LAUNCHERS.find(a => a.id === focusedAgent) : null;
  const focusedLocked = focusedLauncher?.expertOnly && !can(role, "approve:content");

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Bot className="size-6 text-[var(--color-primary)]" /> Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Launch a chat-first agent or open a detailed simulation. <span className="chip ml-2"><Sparkles className="size-3" /> Simulated</span></p>
        </div>
      </div>

      {LAUNCHERS.length > 4 && (
        <div className="relative mt-4 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search agents…"
            className="h-9 w-full rounded-md border border-border bg-[var(--color-input)] pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
        {filtered.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground py-8 text-center">No agents match your search.</div>
        ) : filtered.map(a => {
          const panelId = TO_PANEL_ID[a.id];
          const locked = a.expertOnly && !can(role, "approve:content");
          const isFocused = focusedAgent === a.id;
          return (
            <div
              key={a.id}
              className={`glass-panel p-4 flex flex-col gap-3 min-w-0 transition-all duration-200 ${
                isFocused ? "ring-2 ring-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/10" : ""
              }`}
            >
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
                    onClick={() => setFocusedAgent(s => s === a.id ? null : a.id)}
                    className={`h-10 min-h-11 sm:min-h-10 px-3 rounded-md border text-xs flex items-center gap-1.5 transition-all ${
                      isFocused
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    Detailed simulation <ChevronDown className={`size-3.5 transition-transform ${isFocused ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {a.expertOnly && (
                <span className={`chip text-[10px] ${can(role, "approve:content") ? "chip-accent" : ""}`}>
                  Expert role required {can(role, "approve:content") ? "· unlocked" : "· locked"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {focusedAgent && focusedLauncher && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="size-5 text-[var(--color-primary)]" />
              {focusedLauncher.name} — Detailed Simulation
            </h2>
            <button
              onClick={() => setFocusedAgent(null)}
              className="h-8 px-3 rounded-md border border-border text-xs flex items-center gap-1.5 hover:border-primary/40 transition-all"
            >
              <X className="size-3.5" /> Close
            </button>
          </div>
          <div className="panel-elevated p-4 sm:p-6">
            {focusedAgent === "ingest" && <DocumentIngestAgent />}
            {focusedAgent === "expert" && <IntelExpertAgent readOnly={Boolean(focusedLocked)} />}
            {focusedAgent === "scout" && <PublicScoutAgent />}
          </div>
        </motion.div>
      )}

      <p className="text-[10px] text-muted-foreground mt-6">Educational / procurement planning prototype. Not for clinical use. Each agent maintains its own chat thread in the Ask AI panel.</p>
    </AppShell>
  );
}
