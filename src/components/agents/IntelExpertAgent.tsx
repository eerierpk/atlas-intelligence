import { useEffect, useState } from "react";
import { Check, GitBranch, Save, X as XIcon } from "lucide-react";
import { DEVICES } from "@/lib/atlas/data";

interface VersionEntry {
  id: string;
  ts: number;
  authorLabel: string;
  diffSummary: string;
}

const LS_KEY = "medintel.expertEdits.v1";

function readLog(): Record<string, VersionEntry[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function writeLog(s: Record<string, VersionEntry[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function IntelExpertAgent({ readOnly = false }: { readOnly?: boolean }) {
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const device = DEVICES.find(d => d.id === deviceId)!;
  const currentFact = device.tagline;
  const [proposed, setProposed] = useState(currentFact);
  const [history, setHistory] = useState<VersionEntry[]>([]);

  useEffect(() => {
    setProposed(device.tagline);
    setHistory(readLog()[deviceId] ?? []);
  }, [deviceId, device.tagline]);

  const append = (action: "Accepted" | "Rejected" | "Saved draft") => {
    const log = readLog();
    const entry: VersionEntry = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      authorLabel: "Demo Expert",
      diffSummary: `${action}: "${proposed.slice(0, 80)}${proposed.length > 80 ? "…" : ""}"`,
    };
    log[deviceId] = [entry, ...(log[deviceId] ?? [])].slice(0, 10);
    writeLog(log);
    setHistory(log[deviceId]);
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
      <div className="panel-elevated p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Device</span>
          <select value={deviceId} onChange={e => setDeviceId(e.target.value)}
            className="h-8 px-2 rounded-md bg-[var(--color-input)] border border-border text-xs flex-1">
            {DEVICES.map(d => <option key={d.id} value={d.id}>{d.modality} · {d.vendor} · {d.name}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Current fact (catalog)</div>
            <div className="rounded-md border border-border p-3 text-xs bg-[var(--color-surface)]/50 min-h-[6rem]">{currentFact}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Proposed edit</div>
            <textarea
              value={proposed}
              onChange={e => setProposed(e.target.value)}
              disabled={readOnly}
              rows={4}
              className="w-full rounded-md border border-border p-3 text-xs bg-[var(--color-input)] outline-none focus:border-primary resize-none disabled:opacity-60"
            />
          </div>
        </div>

        {readOnly ? (
          <div className="text-[11px] text-[var(--color-warning)]">Read-only mode — sign in as Healthcare Expert to edit.</div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => append("Accepted")} className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs flex items-center gap-1.5"><Check className="size-3.5" /> Accept</button>
            <button onClick={() => append("Rejected")} className="h-9 px-3 rounded-md border border-border text-xs flex items-center gap-1.5"><XIcon className="size-3.5" /> Reject</button>
            <button onClick={() => append("Saved draft")} className="h-9 px-3 rounded-md border border-border text-xs flex items-center gap-1.5"><Save className="size-3.5" /> Save draft</button>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">Edits are recorded only in this browser (localStorage), not in the catalog.</p>
      </div>

      <div className="panel-elevated p-4">
        <div className="text-sm font-semibold flex items-center gap-2"><GitBranch className="size-4 text-[var(--color-primary)]" /> Version history</div>
        <ol className="mt-3 relative ml-3 border-l border-border space-y-3">
          {history.length === 0 && <li className="text-xs text-muted-foreground pl-4">No edits yet.</li>}
          {history.map((h) => (
            <li key={h.id} className="pl-4 relative">
              <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-[var(--color-primary)]" />
              <div className="text-xs font-medium">{h.diffSummary}</div>
              <div className="text-[10px] text-muted-foreground">{new Date(h.ts).toLocaleString()} · {h.authorLabel}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
