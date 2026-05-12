import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Building2, Filter, Globe2 } from "lucide-react";
import { getHospitalPlacements, type SiteType } from "@/lib/fixtures/hospitals";

const HospitalPlacementsMap = lazy(() =>
  import("./HospitalPlacementsMap").then((m) => ({ default: m.HospitalPlacementsMap })),
);

export function HospitalsSection({ deviceId, modality }: { deviceId: string; modality: string }) {
  const all = useMemo(() => getHospitalPlacements(deviceId, modality), [deviceId, modality]);
  const countries = useMemo(() => Array.from(new Set(all.map((r) => r.country))).sort(), [all]);

  const [country, setCountry] = useState<string>("All");
  const [siteType, setSiteType] = useState<"All" | SiteType>("All");
  const [yearFrom, setYearFrom] = useState(2018);
  const [yearTo, setYearTo] = useState(2025);
  const [mapClient, setMapClient] = useState(false);

  useEffect(() => {
    setMapClient(true);
  }, []);

  const rows = useMemo(
    () =>
      all.filter(
        (r) =>
          (country === "All" || r.country === country) &&
          (siteType === "All" || r.siteType === siteType) &&
          r.year >= yearFrom &&
          r.year <= yearTo,
      ),
    [all, country, siteType, yearFrom, yearTo],
  );

  return (
    <div className="panel-elevated p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="size-4 text-[var(--color-primary)]" /> Hospital placements{" "}
            <span className="chip">Illustrative placements (demo)</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Synthetic dataset for demo purposes. Not real customer placements. Map markers use approximate city coordinates.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select label="Country" value={country} onChange={setCountry} options={["All", ...countries]} />
        <Select
          label="Site type"
          value={siteType}
          onChange={(v) => setSiteType(v as "All" | SiteType)}
          options={["All", "Public", "Private", "Academic"]}
        />
        <Number label="Year from" value={yearFrom} onChange={setYearFrom} min={2015} max={2030} />
        <Number label="Year to" value={yearTo} onChange={setYearTo} min={2015} max={2030} />
        <div className="ml-auto chip">
          <Filter className="size-3" /> {rows.length} sites
        </div>
      </div>

      {/* Map — Leaflet + OpenStreetMap (client only) */}
      <div className="mt-4 rounded-lg border border-border bg-[var(--color-surface)]/50 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Globe2 className="size-3.5" /> Global map
        </div>
        <div className="relative w-full overflow-hidden rounded-md border border-border bg-[var(--color-background)]/40">
          {mapClient ? (
            <Suspense
              fallback={
                <div className="flex h-[min(480px,56vh)] items-center justify-center text-xs text-muted-foreground">
                  Loading map…
                </div>
              }
            >
              <HospitalPlacementsMap rows={rows} />
            </Suspense>
          ) : (
            <div className="h-[min(480px,56vh)] animate-pulse rounded-md bg-[var(--color-secondary)]/40" aria-hidden />
          )}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          ©{" "}
          <a className="text-[var(--color-primary)] hover:underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">
            OpenStreetMap
          </a>{" "}
          contributors · Click a marker for site details. Filters apply to the map and the table.
        </p>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--color-secondary)]/70 backdrop-blur">
              <tr>
                <Th>Country</Th>
                <Th>City</Th>
                <Th>Site type</Th>
                <Th>Modality context</Th>
                <Th>Year</Th>
                <Th>Source</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-[var(--color-surface)]/30" : ""}>
                  <Td>{r.country}</Td>
                  <Td>{r.city}</Td>
                  <Td>
                    <span className="chip">{r.siteType}</span>
                  </Td>
                  <Td className="text-muted-foreground">{r.modalityContext}</Td>
                  <Td className="font-mono">{r.year}</Td>
                  <Td className="text-muted-foreground">{r.source}</Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    No placements match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-border px-3 py-2 text-left font-medium text-muted-foreground">{children}</th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border-b border-border/60 px-3 py-2 ${className}`}>{children}</td>;
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-border bg-[var(--color-input)] px-2 text-xs outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
function Number({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
        className="h-9 w-24 rounded-md border border-border bg-[var(--color-input)] px-2 text-xs outline-none"
      />
    </label>
  );
}
