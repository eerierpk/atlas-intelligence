// Helpers for mocked Report / Share / Email actions
import { toast } from "sonner";

export interface ShareableState {
  title: string;
  summary: string;
  deviceIds?: string[];
  scenario?: string;
}

export function buildShareUrl(state: ShareableState): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.hash = "share=" + encodeURIComponent(JSON.stringify(state));
  return url.toString();
}

export async function copyShareLink(state: ShareableState) {
  const url = buildShareUrl(state);
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Shareable link copied", { description: "Link encodes your current workspace selection." });
  } catch {
    toast.success("Mock share link generated", { description: url.slice(0, 60) + "…" });
  }
}

export function openMailto(state: ShareableState) {
  const subject = encodeURIComponent(`MedIntel Atlas — ${state.title}`);
  const body = encodeURIComponent(
    `${state.summary}\n\n` +
    (state.deviceIds?.length ? `Devices in scope: ${state.deviceIds.join(", ")}\n` : "") +
    (state.scenario ? `Scenario: ${state.scenario}\n\n` : "\n") +
    `— Generated from MedIntel Atlas (planning/procurement intelligence — not diagnostic guidance).\n` +
    `Open: ${buildShareUrl(state)}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function downloadHtmlReport(state: ShareableState, html: string) {
  const blob = new Blob([
    `<!doctype html><html><head><meta charset="utf-8"><title>${state.title}</title>` +
    `<style>body{font-family:Inter,system-ui,sans-serif;color:#0f172a;background:#f8fafc;padding:48px;max-width:920px;margin:auto}` +
    `h1{font-size:28px;margin:0 0 8px}h2{font-size:18px;margin:32px 0 8px;color:#0e7490}` +
    `.muted{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}` +
    `th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}th{background:#f1f5f9}` +
    `.foot{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px}</style></head><body>${html}` +
    `<div class="foot">MedIntel Atlas — Planning/procurement intelligence only. Not diagnostic guidance. AI-generated content; verify with vendor before decisions.</div>` +
    `</body></html>`
  ], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = state.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".html";
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success("Report downloaded", { description: "Open in your browser and print → PDF." });
}
