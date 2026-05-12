import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, GitBranch, Save, Send } from "lucide-react";
import { DEVICES } from "@/lib/atlas/data";
import type { Device, IntelExpertWorkspaceEntry } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

interface VersionEntry {
  id: string;
  ts: number;
  authorLabel: string;
  diffSummary: string;
}

/** Editable catalog-adjacent fields (prototype — not written back to catalog). */
interface ExpertDraft {
  tagline: string;
  clinicalPositioning: string;
  aiWorkflowNotes: string;
  standardsIntegration: string;
  dataSourceNotes: string;
  procurementNotes: string;
}

const LS_HISTORY = "medintel.expertEdits.v1";
const LS_DRAFTS = "medintel.expertDrafts.v1";

function readHistory(): Record<string, VersionEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_HISTORY) || "{}");
  } catch {
    return {};
  }
}

function writeHistory(s: Record<string, VersionEntry[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_HISTORY, JSON.stringify(s));
}

function readDrafts(): Record<string, ExpertDraft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_DRAFTS) || "{}");
  } catch {
    return {};
  }
}

function writeDrafts(s: Record<string, ExpertDraft>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DRAFTS, JSON.stringify(s));
}

function catalogDefaults(d: Device): ExpertDraft {
  return {
    tagline: d.tagline,
    clinicalPositioning: d.clinicalTags.join(", "),
    aiWorkflowNotes: d.aiCapabilities.join(", "),
    standardsIntegration: d.standards.join(", "),
    dataSourceNotes: d.sources.join(" · "),
    procurementNotes: "",
  };
}

function draftSummary(d: ExpertDraft): string {
  const parts = [
    d.tagline.slice(0, 40),
    d.clinicalPositioning ? `${d.clinicalPositioning.slice(0, 24)}…` : "",
  ].filter(Boolean);
  return parts.join(" · ") || "(empty draft)";
}

function appendEntry(deviceId: string, authorLabel: string, diffSummary: string) {
  const log = readHistory();
  const entry: VersionEntry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    authorLabel,
    diffSummary,
  };
  log[deviceId] = [entry, ...(log[deviceId] ?? [])].slice(0, 12);
  writeHistory(log);
  return log[deviceId]!;
}

function buildIntelExpertWorkspaceEntry(deviceId: string, device: Device, draft: ExpertDraft): IntelExpertWorkspaceEntry {
  return {
    id: `intel-expert-${deviceId}`,
    deviceId,
    title: `Intel Expert · ${device.name}`,
    vendor: device.vendor,
    modality: device.modality,
    createdAt: Date.now(),
    draft: { ...draft },
  };
}

const REVIEW_SIM_MS = 2800;

function PairedField({
  label,
  catalogText,
  value,
  onChange,
  disabled,
  rows = 3,
}: {
  label: string;
  catalogText: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  rows?: number;
}) {
  const display = catalogText.trim() ? catalogText : "—";
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="grid min-w-0 gap-2 md:grid-cols-2 md:items-stretch">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/85">Catalog (read-only)</span>
          <div className="min-h-[3.25rem] min-w-0 flex-1 break-words rounded-md border border-border bg-[var(--color-surface)]/70 p-2.5 text-xs leading-relaxed text-muted-foreground">
            {display}
          </div>
        </div>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/85">Proposed edit</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={rows}
            className="min-h-[3.25rem] min-w-0 w-full flex-1 resize-y rounded-md border border-border bg-[var(--color-input)] p-2.5 text-xs leading-relaxed outline-none focus:border-primary disabled:opacity-60"
          />
        </label>
      </div>
    </div>
  );
}

export function IntelExpertAgent({ readOnly = false }: { readOnly?: boolean }) {
  const { upsertIntelExpertSession } = useAtlas();
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const device = DEVICES.find((d) => d.id === deviceId)!;
  const baseline = catalogDefaults(device);
  const [draft, setDraft] = useState<ExpertDraft>(baseline);
  const [history, setHistory] = useState<VersionEntry[]>([]);
  const [reviewRunning, setReviewRunning] = useState(false);
  const reviewTimer = useRef<number | null>(null);

  useEffect(() => {
    const d = DEVICES.find((x) => x.id === deviceId)!;
    const stored = readDrafts()[deviceId];
    setDraft(stored ?? catalogDefaults(d));
    setHistory(readHistory()[deviceId] ?? []);
    setReviewRunning(false);
    if (reviewTimer.current) {
      window.clearTimeout(reviewTimer.current);
      reviewTimer.current = null;
    }
  }, [deviceId]);

  useEffect(() => {
    return () => {
      if (reviewTimer.current) window.clearTimeout(reviewTimer.current);
    };
  }, []);

  const setField = <K extends keyof ExpertDraft>(key: K, value: ExpertDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const persistDraft = () => {
    const all = readDrafts();
    all[deviceId] = draft;
    writeDrafts(all);
  };

  const saveDraft = () => {
    if (readOnly) return;
    persistDraft();
    upsertIntelExpertSession(buildIntelExpertWorkspaceEntry(deviceId, device, draft));
    const h = appendEntry(
      deviceId,
      "Demo Expert",
      `Saved draft — ${draftSummary(draft)} · synced to Workspace (Intel Expert)`,
    );
    setHistory(h);
  };

  const submit = () => {
    if (readOnly) return;
    persistDraft();
    setReviewRunning(true);
    const h = appendEntry(
      deviceId,
      "Demo Expert",
      "Submitted — simulated peer review queue (no external call).",
    );
    setHistory(h);
    if (reviewTimer.current) window.clearTimeout(reviewTimer.current);
    reviewTimer.current = window.setTimeout(() => {
      setReviewRunning(false);
      reviewTimer.current = null;
      setHistory(appendEntry(deviceId, "System", "Simulated peer review completed."));
    }, REVIEW_SIM_MS);
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_minmax(260px,300px)]">
      <div className="panel-elevated min-w-0 space-y-4 overflow-hidden p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">Device</span>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            title={`${device.modality} · ${device.vendor} · ${device.name}`}
            className="h-8 min-w-0 max-w-full flex-1 rounded-md border border-border bg-[var(--color-input)] px-2 text-xs outline-none sm:max-w-[min(100%,42rem)]"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.modality} · {d.vendor} · {d.name}
              </option>
            ))}
          </select>
        </div>

        {!readOnly && reviewRunning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/95">
            <Clock className="mt-0.5 size-3.5 shrink-0 animate-pulse text-amber-400" aria-hidden />
            <span>
              Simulated secondary review in progress (~{Math.ceil(REVIEW_SIM_MS / 1000)}s). You can keep editing; use{" "}
              <strong className="font-medium">Save draft</strong> to store a snapshot in{" "}
              <strong className="font-medium">Workspace → Intel Expert</strong>.
            </span>
          </div>
        )}

        <div className="space-y-4">
          <PairedField
            label="Tagline"
            catalogText={baseline.tagline}
            value={draft.tagline}
            onChange={(v) => setField("tagline", v)}
            disabled={readOnly}
            rows={2}
          />
          <PairedField
            label="Clinical positioning (tags / narrative)"
            catalogText={baseline.clinicalPositioning}
            value={draft.clinicalPositioning}
            onChange={(v) => setField("clinicalPositioning", v)}
            disabled={readOnly}
            rows={3}
          />
          <PairedField
            label="AI & workflow notes"
            catalogText={baseline.aiWorkflowNotes}
            value={draft.aiWorkflowNotes}
            onChange={(v) => setField("aiWorkflowNotes", v)}
            disabled={readOnly}
            rows={3}
          />
          <PairedField
            label="Standards / integration"
            catalogText={baseline.standardsIntegration}
            value={draft.standardsIntegration}
            onChange={(v) => setField("standardsIntegration", v)}
            disabled={readOnly}
            rows={2}
          />
          <PairedField
            label="Data sources (catalog notes)"
            catalogText={baseline.dataSourceNotes}
            value={draft.dataSourceNotes}
            onChange={(v) => setField("dataSourceNotes", v)}
            disabled={readOnly}
            rows={2}
          />
          <PairedField
            label="Procurement / internal notes"
            catalogText={baseline.procurementNotes}
            value={draft.procurementNotes}
            onChange={(v) => setField("procurementNotes", v)}
            disabled={readOnly}
            rows={3}
          />
        </div>

        {readOnly ? (
          <div className="text-[11px] text-[var(--color-warning)]">Read-only mode — sign in as Healthcare Expert to edit.</div>
        ) : (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={reviewRunning}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)] disabled:opacity-50"
            >
              <Send className="size-3.5" /> Submit
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs"
            >
              <Save className="size-3.5" /> Save draft
            </button>
            <Link to="/saved" className="text-[11px] text-[var(--color-primary)] hover:underline">
              Open Workspace →
            </Link>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground">
          Drafts and version history stay in this browser (localStorage). <strong className="font-medium">Save draft</strong>{" "}
          updates the <span className="text-foreground/90">Intel Expert · …</span> card under{" "}
          <Link to="/saved" className="text-[var(--color-primary)] hover:underline">
            Workspace → Intel Expert
          </Link>{" "}
          (not Ask AI). Catalog JSON is never modified here.
        </p>
      </div>

      <div className="panel-elevated min-w-0 overflow-hidden p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <GitBranch className="size-4 text-[var(--color-primary)]" /> Version history
        </div>
        <ol className="relative ml-3 mt-3 space-y-3 border-l border-border">
          {history.length === 0 && <li className="pl-4 text-xs text-muted-foreground">No activity yet.</li>}
          {history.map((h) => (
            <li key={h.id} className="relative pl-4">
              <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-[var(--color-primary)]" />
              <div className="break-words text-xs font-medium">{h.diffSummary}</div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(h.ts).toLocaleString()} · {h.authorLabel}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
