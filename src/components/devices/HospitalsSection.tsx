import { useMemo, useState } from "react";
import { Building2, Filter, Globe2 } from "lucide-react";
import {
  COUNTRY_CENTROIDS, REGION_CONTEXT, getHospitalPlacements, projectLatLng,
  type SiteType,
} from "@/lib/fixtures/hospitals";

export function HospitalsSection({ deviceId, modality }: { deviceId: string; modality: string }) {
  const all = useMemo(() => getHospitalPlacements(deviceId, modality), [deviceId, modality]);
  const countries = useMemo(() => Array.from(new Set(all.map(r => r.country))).sort(), [all]);

  const [country, setCountry] = useState<string>("All");
  const [siteType, setSiteType] = useState<"All" | SiteType>("All");
  const [yearFrom, setYearFrom] = useState(2018);
  const [yearTo, setYearTo] = useState(2025);
  const [hover, setHover] = useState<string | null>(null);

  const rows = useMemo(() => all.filter(r =>
    (country === "All" || r.country === country) &&
    (siteType === "All" || r.siteType === siteType) &&
    r.year >= yearFrom && r.year <= yearTo
  ), [all, country, siteType, yearFrom, yearTo]);

  // Group dots by country for the map
  const dots = useMemo(() => {
    const counts: Record<string, { code: string; n: number }> = {};
    for (const r of rows) {
      counts[r.country] = { code: r.countryCode, n: (counts[r.country]?.n ?? 0) + 1 };
    }
    return Object.entries(counts).map(([name, v]) => {
      const c = COUNTRY_CENTROIDS[v.code];
      const { x, y } = c ? projectLatLng(c.lat, c.lng) : { x: 0, y: 0 };
      return { name, code: v.code, n: v.n, x, y };
    });
  }, [rows]);

  return (
    <div className="panel-elevated p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><Building2 className="size-4 text-[var(--color-primary)]" /> Hospital placements <span className="chip">Illustrative placements (demo)</span></div>
          <p className="text-xs text-muted-foreground mt-1">Synthetic dataset for demo purposes. Not real customer placements.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select label="Country" value={country} onChange={setCountry} options={["All", ...countries]} />
        <Select label="Site type" value={siteType} onChange={(v) => setSiteType(v as "All" | SiteType)} options={["All", "Public", "Private", "Academic"]} />
        <Number label="Year from" value={yearFrom} onChange={setYearFrom} min={2015} max={2030} />
        <Number label="Year to" value={yearTo} onChange={setYearTo} min={2015} max={2030} />
        <div className="ml-auto chip"><Filter className="size-3" /> {rows.length} sites</div>
      </div>

      {/* Map */}
      <div className="mt-4 rounded-lg border border-border bg-[var(--color-surface)]/50 p-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Globe2 className="size-3.5" /> Geographic distribution</div>
        <div className="relative w-full overflow-hidden rounded-md border border-border bg-[var(--color-background)]/40 aspect-[2/1]">
          <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" role="img" aria-label="World map of hospital placements">
            {/* Simplified continents as soft blobs */}
            <g fill="var(--color-secondary)" opacity="0.45">
              <ellipse cx="220" cy="180" rx="140" ry="80" />
              <ellipse cx="290" cy="350" rx="80" ry="110" />
              <ellipse cx="500" cy="170" rx="90" ry="70" />
              <ellipse cx="560" cy="240" rx="70" ry="55" />
              <ellipse cx="700" cy="200" rx="160" ry="100" />
              <ellipse cx="820" cy="380" rx="100" ry="55" />
            </g>
            {dots.map(d => {
              const r = 4 + Math.min(12, d.n * 1.6);
              return (
                <g key={d.code} onMouseEnter={() => setHover(d.code)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
                  <circle cx={d.x} cy={d.y} r={r} fill="var(--color-primary)" opacity="0.25" />
                  <circle cx={d.x} cy={d.y} r={r * 0.5} fill="var(--color-primary)" />
                  {hover === d.code && (
                    <g>
                      <rect x={d.x + 8} y={d.y - 28} width={d.name.length * 6.5 + 50} height="22" rx="4" fill="var(--color-popover)" stroke="var(--color-border)" />
                      <text x={d.x + 14} y={d.y - 13} fontSize="11" fill="var(--color-foreground)">{d.name} · {d.n}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {hover && REGION_CONTEXT[hover] && (
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{REGION_CONTEXT[hover]} <span className="opacity-70">(generic regional context)</span></p>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 rounded-lg border border-border overflow-hidden">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--color-secondary)]/70 backdrop-blur">
              <tr>
                <Th>Country</Th><Th>City</Th><Th>Site type</Th><Th>Modality context</Th><Th>Year</Th><Th>Source</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-[var(--color-surface)]/30" : ""}>
                  <Td>{r.country}</Td>
                  <Td>{r.city}</Td>
                  <Td><span className="chip">{r.siteType}</span></Td>
                  <Td className="text-muted-foreground">{r.modalityContext}</Td>
                  <Td className="text-mono">{r.year}</Td>
                  <Td className="text-muted-foreground">{r.source}</Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-8 text-xs">No placements match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-medium text-muted-foreground border-b border-border">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 border-b border-border/60 ${className}`}>{children}</td>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="h-9 px-2 rounded-md bg-[var(--color-input)] border border-border text-xs outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function Number({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="number" value={value} min={min} max={max} onChange={e => onChange(parseInt(e.target.value) || min)}
        className="h-9 w-24 px-2 rounded-md bg-[var(--color-input)] border border-border text-xs outline-none" />
    </label>
  );
}
