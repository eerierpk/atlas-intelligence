import { useState } from "react";
import { FileText, Link2, Upload } from "lucide-react";
import { SimulatedRunPanel, type RunOutput } from "./SimulatedRunPanel";

const STEPS = [
  { label: "Validating artifact metadata…", durationMs: 600 },
  { label: "Staging content for simulated extraction…", durationMs: 800 },
  { label: "Simulating OCR / transcript extraction…", durationMs: 1200 },
  { label: "Running structural section detection…", durationMs: 900 },
  { label: "Building machine-generated preview…", durationMs: 700 },
  { label: "Queueing package for human review…", durationMs: 850 },
];

export function DocumentIngestAgent() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [size, setSize] = useState<number>(0);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    setError(null);
    if (!filename && !url) { setError("Provide a file or a URL."); return; }
    if (url && !/^https?:\/\//i.test(url)) { setError("URL must start with http:// or https://"); return; }
    setStatus("running"); setOutput(null);
    const total = STEPS.reduce((a, s) => a + (s.durationMs ?? 800), 0);
    setTimeout(() => {
      setStatus("done");
      setOutput(buildOutput(filename || url));
    }, total + 200);
  };

  const reset = () => { setStatus("idle"); setOutput(null); setError(null); };

  return (
    <SimulatedRunPanel
      status={status === "done" ? "done" : status}
      steps={STEPS}
      onStart={start}
      onReset={reset}
      output={output}
      inputs={
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-3 text-xs hover:border-primary/40">
            <Upload className="size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              {filename ? `${filename} · ${(size / 1024).toFixed(1)} KB` : "Choose file (PDF, video — name only)"}
            </span>
            <input type="file" hidden onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFilename(f.name); setSize(f.size); }
            }} />
          </label>
          <div className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border px-2">
            <Link2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://… (optional)"
              className="h-9 min-w-0 w-full flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          {error && <div className="text-[11px] text-[var(--color-destructive)] sm:col-span-2">{error}</div>}
          <p className="text-[10px] text-muted-foreground sm:col-span-2 flex min-w-0 items-start gap-1">
            <FileText className="size-3 mt-0.5 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">Files are not read or transmitted — only the filename is used to generate a demo summary. Output is shown after the human-review queue step (simulated).</span>
          </p>
        </div>
      }
    />
  );
}

function buildOutput(name: string): RunOutput {
  const isVideo = /\.(mp4|mov|webm|avi)$/i.test(name);
  return {
    summary: isVideo
      ? `Simulated transcript signals from "${name}". Preview below — in production this package would await human review before release.`
      : `Simulated structured parse of "${name}". Preview below — in production this package would await human review before release.`,
    bullets: [
      "Document references vendor-published throughput figures consistent with the Atlas catalog.",
      "Mentions of DL-reconstruction tooling map to known capability tags (DL recon).",
      "No explicit dose figures detected — supplementary physicist review may be requested after human triage.",
      "Nothing is auto-applied to the catalog until an expert approves (outside this demo).",
    ],
    confidence: 78,
    sources: [
      { label: "Atlas catalog", url: "#" },
      { label: "Mocked extraction service", url: "#" },
    ],
  };
}
