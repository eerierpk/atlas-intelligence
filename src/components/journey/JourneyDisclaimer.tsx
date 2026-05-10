import { ShieldAlert } from "lucide-react";

export function JourneyDisclaimer() {
  return (
    <footer className="mt-8 rounded-lg border border-border bg-[var(--color-surface)]/60 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
      <ShieldAlert className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
      <span>
        <strong className="text-foreground">Educational only.</strong> Not medical advice and not a substitute for OEM Instructions for Use, institutional policy, or qualified professionals (medical physicists, radiologists, MR Safety Experts, biomedical engineers).
        Site requirements, regulations, and clinical workflows vary by institution, OEM, and jurisdiction — always defer to local authorities and current standards.
      </span>
    </footer>
  );
}
