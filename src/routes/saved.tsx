import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, GitCompare, Sparkles, Trash2, Share2, Mail, FileDown } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { useAiPanelUi } from "@/lib/atlas/ai-panel-context";
import { useAtlas } from "@/lib/atlas/store";
import { getDevice } from "@/lib/atlas/data";
import { copyShareLink, openMailto, downloadHtmlReport } from "@/lib/atlas/share";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const { open: openAiPanel } = useAiPanelUi();
  const { savedDevices, toggleSaved, savedComparisons, removeSavedComparison, aiSessions, removeSession } = useAtlas();

  const shareState = {
    title: "Atlas Workspace",
    summary: `Workspace snapshot: ${savedDevices.length} saved · ${savedComparisons.length} comparisons · ${aiSessions.length} AI sessions.`,
    deviceIds: savedDevices,
  };

  const onReport = () => {
    const html = `<h1>MedIntel Atlas — Workspace Snapshot</h1>
      <p class="muted">Generated ${new Date().toLocaleString()}</p>
      <h2>Saved devices (${savedDevices.length})</h2>
      <table><thead><tr><th>Modality</th><th>Vendor</th><th>Name</th><th>Tier</th><th>AI</th></tr></thead><tbody>
        ${savedDevices.map(id => getDevice(id)).filter(Boolean).map(d => `<tr><td>${d!.modality}</td><td>${d!.vendor}</td><td>${d!.name}</td><td>${d!.budgetTier}</td><td>${d!.aiMaturity}/5</td></tr>`).join("")}
      </tbody></table>
      <h2>Saved comparisons (${savedComparisons.length})</h2>
      <ul>${savedComparisons.map(c => `<li><strong>${c.title}</strong> — ${c.deviceIds.map(id => getDevice(id)?.name).join(", ")}</li>`).join("")}</ul>
      <h2>AI sessions (${aiSessions.length})</h2>
      <ul>${aiSessions.map(s => `<li>${s.title} (${s.messages.length} messages)</li>`).join("")}</ul>`;
    downloadHtmlReport(shareState, html);
  };

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Session-only — your saved devices, comparisons, AI threads, and exports.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReport} className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5"><FileDown className="size-4" /> Generate report</button>
          <button onClick={() => copyShareLink(shareState)} className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5"><Share2 className="size-4" /> Share</button>
          <button onClick={() => openMailto(shareState)} className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5"><Mail className="size-4" /> Email</button>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-3 gap-4">
        <Section title="Saved devices" icon={<Bookmark className="size-4 text-[var(--color-primary)]" />} count={savedDevices.length}>
          {savedDevices.length === 0 ? <Empty text="No saved devices yet." /> : (
            <ul className="flex flex-col gap-1.5">
              {savedDevices.map(id => {
                const d = getDevice(id)!;
                return (
                  <li key={id} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2">
                    <span className="chip">{d.modality}</span>
                    <Link to="/devices/$deviceId" params={{ deviceId: id }} className="text-sm font-medium hover:text-[var(--color-primary)] truncate">{d.name}</Link>
                    <button onClick={() => toggleSaved(id)} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Saved comparisons" icon={<GitCompare className="size-4 text-[var(--color-primary)]" />} count={savedComparisons.length}>
          {savedComparisons.length === 0 ? <Empty text="No saved comparisons." /> : (
            <ul className="flex flex-col gap-2">
              {savedComparisons.map(c => (
                <li key={c.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold truncate">{c.title}</div>
                    <button onClick={() => removeSavedComparison(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{c.deviceIds.map(id => getDevice(id)?.name).filter(Boolean).join(" · ")}</div>
                  <Link to="/compare" className="mt-2 inline-flex chip chip-accent">Reopen →</Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="AI sessions" icon={<Sparkles className="size-4 text-[var(--color-primary)]" />} count={aiSessions.length}>
          {aiSessions.length === 0 ? <Empty text="No AI sessions yet." /> : (
            <ul className="flex flex-col gap-2">
              {aiSessions.map(s => (
                <li key={s.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                    <button onClick={() => removeSession(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{s.messages.length} messages</div>
                  <button type="button" onClick={() => openAiPanel()} className="mt-2 inline-flex chip chip-accent">Open Ask AI →</button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="panel-elevated p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">{icon}{title}</div>
        <span className="chip">{count}</span>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{text}</div>;
}
