import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Grid3x3, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DeviceCard } from "@/components/atlas/DeviceCard";
import { DEVICES } from "@/lib/atlas/data";
import type { BudgetTier, Modality, Vendor } from "@/lib/atlas/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: Explore,
});

const MODALITY_OPTIONS: Modality[] = ["MRI", "CT", "X-ray", "Ultrasound", "Mammography", "PET/CT"];
const VENDOR_OPTIONS: Vendor[] = ["Siemens Healthineers", "GE HealthCare", "Philips", "Canon Medical", "Hologic", "Fujifilm"];
const BUDGET_OPTIONS: BudgetTier[] = ["Entry", "Mid", "Premium", "Flagship"];

interface DeviceFilters {
  modalities: Modality[];
  vendors: Vendor[];
  budgetTiers: BudgetTier[];
  minAiMaturity: number;
}

const EMPTY_FILTERS: DeviceFilters = {
  modalities: [],
  vendors: [],
  budgetTiers: [],
  minAiMaturity: 0,
};

function applyDeviceFiltersLocal(devices: typeof DEVICES, f: DeviceFilters) {
  return devices.filter((d) =>
    (!f.modalities.length || f.modalities.includes(d.modality)) &&
    (!f.vendors.length || f.vendors.includes(d.vendor)) &&
    (!f.budgetTiers.length || f.budgetTiers.includes(d.budgetTier)) &&
    d.aiMaturity >= f.minAiMaturity
  );
}

function Explore() {
  const { q: searchQ } = Route.useSearch();
  const isMobile = useIsMobile();
  const [q, setQ] = useState(searchQ);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DeviceFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<DeviceFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const desktopPanelRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const scoped = applyDeviceFiltersLocal(DEVICES, appliedFilters);
    return scoped.filter(d => {
      if (q) {
        const s = q.toLowerCase();
        if (!`${d.name} ${d.vendor} ${d.tagline} ${d.clinicalTags.join(" ")}`.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [q, appliedFilters]);

  const activeChips = [
    ...appliedFilters.modalities.map(v => ({ key: `m-${v}`, label: v, onClick: () => setAppliedFilters((prev) => ({ ...prev, modalities: prev.modalities.filter(x => x !== v) })) })),
    ...appliedFilters.vendors.map(v => ({ key: `v-${v}`, label: v, onClick: () => setAppliedFilters((prev) => ({ ...prev, vendors: prev.vendors.filter(x => x !== v) })) })),
    ...appliedFilters.budgetTiers.map(v => ({ key: `b-${v}`, label: `${v} tier`, onClick: () => setAppliedFilters((prev) => ({ ...prev, budgetTiers: prev.budgetTiers.filter(x => x !== v) })) })),
    ...(appliedFilters.minAiMaturity > 0 ? [{ key: "ai", label: `AI ≥ ${appliedFilters.minAiMaturity}/5`, onClick: () => setAppliedFilters((prev) => ({ ...prev, minAiMaturity: 0 })) }] : []),
  ];

  useEffect(() => {
    setIsLoading(true);
    const t = window.setTimeout(() => setIsLoading(false), 220);
    return () => window.clearTimeout(t);
  }, [q, appliedFilters]);

  useEffect(() => {
    setQ(searchQ);
  }, [searchQ]);

  useEffect(() => {
    if (isMobile || !filtersOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!desktopPanelRef.current) return;
      if (!desktopPanelRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isMobile, filtersOpen]);

  useEffect(() => {
    if (filtersOpen) setDraftFilters(appliedFilters);
  }, [filtersOpen, appliedFilters]);

  const resetAll = () => {
    setQ("");
    setAppliedFilters(EMPTY_FILTERS);
  };
  const resetDraft = () => setDraftFilters(EMPTY_FILTERS);
  const applyDraftFilters = () => {
    setAppliedFilters(draftFilters);
    setFiltersOpen(false);
  };

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">Search and filter indexed equipment across categories and OEMs — scoped industry-wide; demo data shown here.</p>
        </div>
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 hover:border-primary/40">
                  <SlidersHorizontal className="size-4" /> Filters
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter devices</SheetTitle>
                  <SheetDescription>Vendor, budget, modality and AI maturity apply only to this catalog view.</SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <FiltersBody filters={draftFilters} setFilters={setDraftFilters} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={resetDraft}
                      className="h-8 text-xs rounded-md border border-border hover:border-destructive/40 hover:text-destructive"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyDraftFilters}
                      className="h-8 text-xs rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="relative" ref={desktopPanelRef}>
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5 hover:border-primary/40"
              >
                <SlidersHorizontal className="size-4" /> Filters
              </button>
              {filtersOpen && (
                <div className="absolute right-0 top-11 z-30 w-[340px] panel-elevated p-3 shadow-2xl">
                  <div className="mb-2">
                    <div className="text-sm font-semibold">Filter devices</div>
                    <div className="text-[11px] text-muted-foreground">Vendor, budget, modality and AI maturity apply only to this catalog view.</div>
                  </div>
                  <FiltersBody filters={draftFilters} setFilters={setDraftFilters} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={resetDraft}
                      className="h-8 text-xs rounded-md border border-border hover:border-destructive/40 hover:text-destructive"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyDraftFilters}
                      className="h-8 text-xs rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 panel p-1">
            <button onClick={() => setView("grid")} className={`size-8 grid place-items-center rounded ${view === "grid" ? "bg-[var(--color-accent)]/40 text-[var(--color-primary)]" : "text-muted-foreground"}`}><Grid3x3 className="size-4" /></button>
            <button onClick={() => setView("list")} className={`size-8 grid place-items-center rounded ${view === "list" ? "bg-[var(--color-accent)]/40 text-[var(--color-primary)]" : "text-muted-foreground"}`}><LayoutList className="size-4" /></button>
          </div>
        </div>
      </div>

      <div className="mt-4 panel-elevated p-3 sm:p-4">
        <div className="flex items-center gap-2 h-10 px-2.5 rounded-md bg-[var(--color-input)] border border-border focus-within:border-primary">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, vendor, scenario, clinical focus..." className="flex-1 bg-transparent outline-none text-sm" />
          {q && <button onClick={() => setQ("")}><X className="size-3.5 text-muted-foreground" /></button>}
        </div>
        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 items-center pt-2 border-t border-border">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected</span>
            {activeChips.map((c) => (
              <button key={c.key} onClick={c.onClick} className="chip chip-accent hover:opacity-85">{c.label}<X className="size-3" /></button>
            ))}
            <button onClick={resetAll} className="text-[11px] text-muted-foreground hover:text-foreground">Clear all</button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "system" : "systems"} match</div>
      {isLoading ? (
        <div className={view === "grid" ? "mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-3" : "mt-3 panel-elevated p-3"}>
          {Array.from({ length: view === "grid" ? 6 : 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-[var(--color-surface-elevated)]/60 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-3">
          {filtered.length === 0 ? (
            <div className="panel-elevated p-12 text-center">
              <div className="text-sm font-semibold">No results</div>
              <p className="text-xs text-muted-foreground mt-1">Adjust filters to broaden the search.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(d => <DeviceCard key={d.id} device={d} />)}
            </div>
          ) : (
            <div className="panel-elevated divide-y divide-border">
              {filtered.map(d => (
                <Link key={d.id} to="/devices/$deviceId" params={{ deviceId: d.id }} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-secondary)]/30">
                  <span className="chip">{d.modality}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{d.vendor} · {d.tagline}</div>
                  </div>
                  <div className="ml-auto text-[11px] text-muted-foreground hidden md:flex gap-3">
                    <span>{d.modality === "MRI" ? `${d.fieldStrengthT}T` : `${d.sliceCount} slc`}</span>
                    <span>{d.throughputPerDay}/d</span>
                    <span>AI {d.aiMaturity}/5</span>
                    <span>${d.estCostUSDm.toFixed(1)}M</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function FiltersBody({
  filters,
  setFilters,
}: {
  filters: DeviceFilters;
  setFilters: (next: DeviceFilters) => void;
}) {
  const toggleArr = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  return (
    <div className="panel-elevated p-4">
      <div className="flex items-center gap-2 text-xs font-semibold mb-3"><Filter className="size-3.5" /> Catalog filters</div>
      <Group label="Vendor">
        <div className="flex flex-col gap-1.5">
          {VENDOR_OPTIONS.map(v => (
            <label key={v} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={filters.vendors.includes(v)} onChange={() => setFilters({ ...filters, vendors: toggleArr(filters.vendors, v) })} className="accent-[var(--color-primary)]" />
              {v}
            </label>
          ))}
        </div>
      </Group>

      <Group label="Budget tier">
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_OPTIONS.map(t => (
            <button key={t} type="button" onClick={() => setFilters({ ...filters, budgetTiers: toggleArr(filters.budgetTiers, t) })} className={`chip ${filters.budgetTiers.includes(t) ? "chip-accent" : ""}`}>{t}</button>
          ))}
        </div>
      </Group>

      <Group label="Modalities">
        <div className="flex flex-wrap gap-1.5">
          {MODALITY_OPTIONS.map(m => (
            <button key={m} type="button" onClick={() => setFilters({ ...filters, modalities: toggleArr(filters.modalities, m) })} className={`chip ${filters.modalities.includes(m) ? "chip-accent" : ""}`}>{m}</button>
          ))}
        </div>
      </Group>

      <Group label={`Min AI maturity · ${filters.minAiMaturity}/5`}>
        <input type="range" min={0} max={5} value={filters.minAiMaturity} onChange={e => setFilters({ ...filters, minAiMaturity: Number(e.target.value) })} className="w-full accent-[var(--color-primary)]" />
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
