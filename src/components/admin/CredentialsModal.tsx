import { useState } from "react";
import { Copy, Mail, X } from "lucide-react";
import type { OutboxEntry } from "@/lib/atlas/admin-store";

export function CredentialsModal({ entry, onClose }: { entry: OutboxEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-md p-5 rounded-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-[var(--color-accent)]/60 grid place-items-center"><Mail className="size-4 text-[var(--color-primary)]" /></div>
            <div>
              <div className="text-sm font-semibold">Email queued (Simulated)</div>
              <div className="text-[11px] text-muted-foreground">Prototype — no real SMTP. Copy credentials manually.</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="size-8 grid place-items-center rounded-md border border-border hover:border-primary/40"><X className="size-4" /></button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <Row k="To" v={entry.to} />
          <Row k="Subject" v={entry.subject} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Temporary password</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm rounded-md border border-border bg-[var(--color-input)] px-3 py-2">{entry.tempPassword}</code>
              <button onClick={copy} className="h-10 px-3 rounded-md border border-border hover:border-primary/40 text-xs flex items-center gap-1.5">
                <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">View message body</summary>
            <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] bg-[var(--color-input)] border border-border rounded-md p-3">{entry.body}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground w-16 shrink-0">{k}</div>
      <div className="text-sm break-all">{v}</div>
    </div>
  );
}
