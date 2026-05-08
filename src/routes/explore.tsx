import { createFileRoute } from "@tanstack/react-router";
import { Filter, Grid3x3, LayoutList, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DeviceCard } from "@/components/atlas/DeviceCard";
import { DEVICES } from "@/lib/atlas/data";
import type { BudgetTier, Modality, Vendor } from "@/lib/atlas/types";

export const Route = createFileRoute("/explore")({
  component: Explore,
});

const VENDOR_LIST: Vendor[] = ["Siemens Healthineers", "GE HealthCare", "Philips", "Canon Medical"];
const TIERS: BudgetTier[] = ["Entry", "Mid", "Premium", "Flagship"];

function Explore() {
  const [q, setQ] = useState("");
  const [modality, setModality] = useState<Modality | "ALL">("ALL");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tiers, setTiers] = useState<BudgetTier[]>([]);
  const [aiMin, setAiMin] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return DEVICES.filter(d => {
      if (modality !== "ALL" && d.modality !== modality) return false;
      if (vendors.length && !vendors.includes(d.vendor)) return false;
      if (tiers.length && !tiers.includes(d.budgetTier)) return false;
      if (d.aiMaturity < aiMin) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!`${d.name} ${d.vendor} ${d.tagline} ${d.clinicalTags.join(" ")}`.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [q, modality, vendors, tiers, aiMin]);

  const toggleArr = <T,>(arr: T[], v: T, set: (x: T[]) => void) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Explore Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">Search and filter the indexed MRI &amp; CT systems across vendors.</p>
        </div>
        <div className="flex items-center gap-1 panel p-1">
          <button onClick={() => setView("grid")} className={`size-8 grid place-items-center rounded ${view === "grid" ? "bg-[var(--color-accent)]/40 text-[var(--color-primary)]" : "text-muted-foreground"}`}><Grid3x3 className="size-4" /></button>
          <button onClick={() => setView("list")} className={`size-8 grid place-items-center rounded ${view === "list" ? "bg-[var(--color-accent)]/40 text-[var(--color-primary)]" : "text-muted-foreground"}`}><LayoutList className="size-4" /></button>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Filters */}
        <aside className="panel-elevated p-4 h-fit sticky top-20">
          <div className="flex items-center gap-2 text-xs font-semibold mb-3"><Filter className="size-3.5" /> Filters</div>

          <Group label="Search">
            <div className="flex items-center gap-2 h-9 px-2.5 rounded-md bg-[var(--color-input)] border border-border focus-within:border-primary">
              <Search className="size-3.5 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, vendor, scenario…" className="flex-1 bg-transparent outline-none text-sm" />
              {q && <button onClick={() => setQ("")}><X className="size-3.5 text-muted-foreground" /></button>}
            </div>
          </Group>

          <Group label="Modality">
            <div className="flex gap-1.5">
              {(["ALL", "MRI", "CT"] as const).map(m => (
                <button key={m} onClick={() => setModality(m)} className={`flex-1 h-8 text-xs rounded-md border ${modality === m ? "border-primary text-[var(--color-primary)] bg-[var(--color-accent)]/40" : "border-border text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>
          </Group>

          <Group label="Vendor">
            <div className="flex flex-col gap-1.5">
              {VENDOR_LIST.map(v => (
                <label key={v} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={vendors.includes(v)} onChange={() => toggleArr(vendors, v, setVendors)} className="accent-[var(--color-primary)]" />
                  {v}
                </label>
              ))}
            </div>
          </Group>

          <Group label="Budget tier">
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map(t => (
                <button key={t} onClick={() => toggleArr(tiers, t, setTiers)} className={`chip ${tiers.includes(t) ? "chip-accent" : ""}`}>{t}</button>
              ))}
            </div>
          </Group>

          <Group label={`Min AI maturity · ${aiMin}/5`}>
            <input type="range" min={0} max={5} value={aiMin} onChange={e => setAiMin(Number(e.target.value))} className="w-full accent-[var(--color-primary)]" />
          </Group>

          <button
            onClick={() => { setQ(""); setModality("ALL"); setVendors([]); setTiers([]); setAiMin(0); }}
            className="mt-2 w-full h-8 text-xs rounded-md border border-border hover:border-destructive/40 hover:text-destructive"
          >Reset filters</button>
        </aside>

        {/* Results */}
        <div>
          <div className="text-xs text-muted-foreground mb-3">{filtered.length} {filtered.length === 1 ? "system" : "systems"} match</div>
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
                <a key={d.id} href={`/devices/${d.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-secondary)]/30">
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
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
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
