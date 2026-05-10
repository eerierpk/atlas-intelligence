import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ElementTile, GlossaryTerm } from "@/lib/journey/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LAYERS: ElementTile["layer"][] = ["Modality", "Workstation", "Network", "Archive/Cloud"];

export function ElementsMap({ elements }: { elements: ElementTile[] }) {
  const grouped = useMemo(() => {
    const m = new Map<ElementTile["layer"], ElementTile[]>();
    LAYERS.forEach((l) => m.set(l, []));
    elements.forEach((e) => m.get(e.layer)!.push(e));
    return m;
  }, [elements]);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {LAYERS.map((layer) => (
        <div key={layer} className="rounded-lg border border-border bg-[var(--color-surface)]/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] mb-2">{layer}</div>
          <div className="space-y-1.5">
            {(grouped.get(layer) ?? []).map((e) => (
              <Sheet key={e.id}>
                <SheetTrigger asChild>
                  <button className="w-full text-left rounded-md border border-border bg-[var(--color-surface)]/70 px-2.5 py-2 hover:border-primary/40 transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium truncate">{e.name}</div>
                      <span className={cn(
                        "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                        e.category === "Hardware" && "bg-sky-500/15 text-sky-300",
                        e.category === "Software" && "bg-violet-500/15 text-violet-300",
                        e.category === "Ecosystem" && "bg-emerald-500/15 text-emerald-300",
                      )}>{e.category}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">{e.blurb}</div>
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{e.name}</SheetTitle>
                    <SheetDescription>{e.layer} · {e.category}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="text-foreground/90 leading-relaxed">{e.blurb}</p>
                    <p className="text-muted-foreground leading-relaxed">{e.detail}</p>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GlossaryView({ terms }: { terms: GlossaryTerm[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return terms;
    return terms.filter((t) => t.term.toLowerCase().includes(s) || t.short.toLowerCase().includes(s));
  }, [terms, q]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search glossary…"
          className="w-full h-9 pl-9 pr-3 rounded-md bg-[var(--color-input)] border border-border text-sm"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <div key={t.term} className="rounded-md border border-border bg-[var(--color-surface)]/60 p-3">
            <div className="text-sm font-semibold text-[var(--color-primary)]">{t.term}</div>
            <div className="text-xs text-foreground/85 mt-1 leading-relaxed">{t.short}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground col-span-full p-4 text-center border border-dashed border-border rounded-md">
            No matches.
          </div>
        )}
      </div>
    </div>
  );
}
