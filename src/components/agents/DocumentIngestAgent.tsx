import { useState } from "react";
import { FileText, Link2, Upload } from "lucide-react";
import { SimulatedRunPanel, type RunOutput } from "./SimulatedRunPanel";

const STEPS = [
  { label: "Validating input…", durationMs: 600 },
  { label: "Sanitizing payload…", durationMs: 800 },
  { label: "Simulating OCR / transcript extraction…", durationMs: 1200 },
  { label: "Running structural section detection…", durationMs: 900 },
  { label: "Composing summary…", durationMs: 800 },
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
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="rounded-md border border-dashed border-border p-3 flex items-center gap-2 text-xs cursor-pointer hover:border-primary/40">
            <Upload className="size-4 text-[var(--color-primary)]" />
            <span className="truncate">{filename ? `${filename} · ${(size / 1024).toFixed(1)} KB` : "Choose file (PDF, video — name only)"}</span>
            <input type="file" hidden onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFilename(f.name); setSize(f.size); }
            }} />
          </label>
          <div className="flex items-center gap-2 rounded-md border border-border px-2">
            <Link2 className="size-3.5 text-muted-foreground" />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… (optional)"
              className="flex-1 h-9 bg-transparent text-xs outline-none" />
          </div>
          {error && <div className="text-[11px] text-[var(--color-destructive)] sm:col-span-2">{error}</div>}
          <p className="text-[10px] text-muted-foreground sm:col-span-2 flex items-center gap-1"><FileText className="size-3" /> Files are not read or uploaded — only the filename is used to generate a demo summary.</p>
        </div>
      }
    />
  );
}

function buildOutput(name: string): RunOutput {
  const isVideo = /\.(mp4|mov|webm|avi)$/i.test(name);
  return {
    summary: isVideo
      ? `Simulated transcript extracted from "${name}". Three high-signal takeaways below.`
      : `Simulated parse of "${name}". Detected sections: Abstract, Methods, Results, Conclusion. Three high-signal takeaways below.`,
    bullets: [
      "Document references vendor-published throughput figures consistent with the Atlas catalog.",
      "Mentions of DL-reconstruction tooling map to known capability tags (DL recon).",
      "No explicit dose figures detected — request supplementary data from physicist if procurement-relevant.",
    ],
    confidence: 78,
    sources: [
      { label: "Atlas catalog", url: "#" },
      { label: "Mocked extraction service", url: "#" },
    ],
  };
}
