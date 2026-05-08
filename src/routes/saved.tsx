import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, GitCompare, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/atlas/AppShell";
import { useAtlas } from "@/lib/atlas/store";
import { getDevice } from "@/lib/atlas/data";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const { savedDevices, toggleSaved, savedComparisons, removeSavedComparison, aiSessions, removeSession } = useAtlas();

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">Session-only — your saved devices, comparisons and AI sessions.</p>
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
                  <Link to="/assistant" className="mt-2 inline-flex chip chip-accent">Open Assistant →</Link>
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
