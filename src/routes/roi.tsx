import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, ChevronDown, ChevronRight, Info, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { DEVICES, getDevice } from "@/lib/atlas/data";
import {
  applyDeviceScenarioRules,
  computeRoi,
  defaultsFromDevice,
  machineAnchorsFromDevice,
  scenarioBoundsFromDevice,
  type RoiScenarioInputs,
} from "@/lib/atlas/roi-calculator";
import type { Device, Modality } from "@/lib/atlas/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roi")({
  component: RoiCalculatorPage,
  validateSearch: (search: Record<string, unknown>) => ({
    device: typeof search.device === "string" ? search.device : "",
  }),
});

const MODALITIES: Modality[] = ["MRI", "CT", "X-ray", "Ultrasound", "Mammography", "PET/CT"];

const fmtUsd0 = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtUsd2 = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

function devicePickerLabel(d: Device) {
  return `${d.name} · ${d.vendor}`;
}

function DeviceSearchCombobox({
  deviceId,
  onDeviceIdChange,
}: {
  deviceId: string;
  onDeviceIdChange: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getDevice(deviceId);

  useEffect(() => {
    if (selected) setQuery(devicePickerLabel(selected));
  }, [deviceId, selected?.id]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEVICES;
    return DEVICES.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.modality.toLowerCase().includes(q) ||
        d.clinicalTags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const pick = (id: string) => {
    const d = getDevice(id);
    if (d) setQuery(devicePickerLabel(d));
    onDeviceIdChange(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative mt-1.5" aria-labelledby="roi-device-label">
      <div className="flex rounded-md border border-border bg-[var(--color-input)] focus-within:border-primary">
        <Search className="pointer-events-none ml-2.5 size-4 shrink-0 self-center text-muted-foreground" aria-hidden />
        <input
          id="roi-device"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="roi-device-listbox"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              const d = getDevice(deviceId);
              if (d) setQuery(devicePickerLabel(d));
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              const d = getDevice(deviceId);
              if (d) setQuery(devicePickerLabel(d));
              setOpen(false);
            }, 180);
          }}
          placeholder="Search name, vendor, modality…"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />
        <button
          type="button"
          className="flex shrink-0 items-center border-l border-border px-2.5 text-muted-foreground hover:bg-[var(--color-secondary)]/50"
          aria-label={open ? "Collapse list" : "Expand list"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div
          id="roi-device-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-[var(--color-popover)] p-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">No matches.</div>
          ) : (
            MODALITIES.map((m) => {
              const group = filtered.filter((d) => d.modality === m);
              if (!group.length) return null;
              return (
                <div key={m}>
                  <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m}</div>
                  {group.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      role="option"
                      aria-selected={d.id === deviceId}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--color-accent)]/40",
                        d.id === deviceId && "bg-[var(--color-accent)]/50",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(d.id);
                      }}
                    >
                      <span className="font-medium">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.vendor}</span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function RoiCalculatorPage() {
  const { device: deviceFromUrl } = Route.useSearch();
  const initialId =
    (deviceFromUrl && getDevice(deviceFromUrl) ? deviceFromUrl : DEVICES[0]?.id) ?? "";

  const [deviceId, setDeviceId] = useState(initialId);
  const [inputs, setInputs] = useState<RoiScenarioInputs>(() => {
    const d = getDevice(initialId);
    return d ? defaultsFromDevice(d) : defaultsFromDevice(DEVICES[0]);
  });

  useEffect(() => {
    if (deviceFromUrl && getDevice(deviceFromUrl)) setDeviceId(deviceFromUrl);
  }, [deviceFromUrl]);

  useEffect(() => {
    const d = getDevice(deviceId);
    if (d) setInputs(defaultsFromDevice(d));
  }, [deviceId]);

  const device = getDevice(deviceId);
  const anchors = useMemo(() => (device ? machineAnchorsFromDevice(device) : null), [device]);
  const bounds = useMemo(() => (device ? scenarioBoundsFromDevice(device) : null), [device]);
  const results = useMemo(() => computeRoi(inputs, anchors?.ratedExamsPerDay ?? 0), [inputs, anchors]);

  const setField = <K extends keyof RoiScenarioInputs>(key: K, value: RoiScenarioInputs[K]) => {
    setInputs((prev) => (device ? applyDeviceScenarioRules({ ...prev, [key]: value }, device) : { ...prev, [key]: value }));
  };

  if (!device) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">No devices in catalog.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-[var(--color-accent)]/30">
            <Calculator className="size-5 text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">ROI calculator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Capex and rated daily capacity come from this catalog device. Annual exam volume is your scheduled exams/day × operating days/year; utilization vs rated throughput is derived from that schedule. Revenue, variable cost, and fixed OPEX stay in realistic bands. Planning-grade only — not financial advice.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-5">
            <div className="panel-elevated p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</div>
              <span className="mt-3 block text-sm font-medium" id="roi-device-label">
                Select machine
              </span>
              <DeviceSearchCombobox deviceId={deviceId} onDeviceIdChange={setDeviceId} />
              <Link
                to="/devices/$deviceId"
                params={{ deviceId: device.id }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                View device profile <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="panel-elevated p-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario</div>

              <LockedMetric
                label="Capital cost (capex)"
                hint="Locked to this system’s catalog acquisition estimate (not varied like payer or schedule assumptions)."
                value={fmtUsd0(anchors.capexUsd)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  resetKey={deviceId}
                  label="Scheduled exams / day"
                  hint={`Within ${bounds.examsPerDay.min}–${bounds.examsPerDay.max} (rated capacity ${anchors.ratedExamsPerDay}/day).`}
                  value={inputs.examsPerDay}
                  onCommit={(v) => setField("examsPerDay", v)}
                  min={bounds.examsPerDay.min}
                  max={bounds.examsPerDay.max}
                  integer
                />
                <Field
                  resetKey={deviceId}
                  label="Operating days / year"
                  hint={`Typical imaging schedule band ${bounds.operatingDaysPerYear.min}–${bounds.operatingDaysPerYear.max} days.`}
                  value={inputs.operatingDaysPerYear}
                  onCommit={(v) => setField("operatingDaysPerYear", v)}
                  min={bounds.operatingDaysPerYear.min}
                  max={bounds.operatingDaysPerYear.max}
                  integer
                />
              </div>
              <DerivedScheduleMetric
                utilizationPct={results.scheduleUtilizationPct}
                annualExams={results.annualExamVolume}
                catalogOemUptimePct={anchors.catalogOemUptimePct}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  resetKey={deviceId}
                  label="Revenue per exam"
                  hint={`Site payer mix; band vs reference ${fmtUsd0(anchors.referenceVariableCostPerExamUsd)} study cost.`}
                  value={inputs.revenuePerExamUsd}
                  onCommit={(v) => setField("revenuePerExamUsd", v)}
                  prefix="$"
                  min={bounds.revenuePerExamUsd.min}
                  max={bounds.revenuePerExamUsd.max}
                />
                <Field
                  resetKey={deviceId}
                  label="Variable cost per exam"
                  hint={`Protocol variability around reference ${fmtUsd0(anchors.referenceVariableCostPerExamUsd)}.`}
                  value={inputs.variableCostPerExamUsd}
                  onCommit={(v) => setField("variableCostPerExamUsd", v)}
                  prefix="$"
                  min={bounds.variableCostPerExamUsd.min}
                  max={bounds.variableCostPerExamUsd.max}
                />
              </div>
              <Field
                resetKey={deviceId}
                label="Annual fixed costs"
                hint={`Service, allocated labour, space — scaled as % of capex (${fmtUsd0(bounds.annualFixedCostsUsd.min)}–${fmtUsd0(bounds.annualFixedCostsUsd.max)}).`}
                value={inputs.annualFixedCostsUsd}
                onCommit={(v) => setField("annualFixedCostsUsd", v)}
                prefix="$"
                formatThousands
                min={bounds.annualFixedCostsUsd.min}
                max={bounds.annualFixedCostsUsd.max}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-[calc(3.5rem+1rem)] space-y-4">
              <div className="glass-panel p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Annual exams = scheduled/day × operating days/year. Annual net = that volume × (revenue − variable) − fixed. Payback = capex ÷ annual net (undiscounted).
                </p>

                <dl className="mt-4 space-y-3 text-sm">
                  <ResultRow label="Annual exam volume" value={results.annualExamVolume.toLocaleString()} />
                  <ResultRow
                    label="Schedule vs rated daily capacity"
                    value={`${results.scheduleUtilizationPct.toFixed(1)}%`}
                  />
                  <ResultRow label="Net margin / exam" value={fmtUsd2(results.netMarginPerExam)} />
                  <ResultRow
                    label="Annual net cash"
                    value={fmtUsd0(results.annualNetCash)}
                    valueClass={results.annualNetCash < 0 ? "text-[var(--color-warning)]" : undefined}
                  />
                  <ResultRow
                    label="Payback"
                    value={
                      results.paybackYears != null
                        ? `${results.paybackYears.toFixed(1)} yrs (${results.breakEvenMonths!.toFixed(0)} mo)`
                        : "— (no positive annual net)"
                    }
                  />
                  <ResultRow
                    label="5-year net profit"
                    value={fmtUsd0(results.fiveYearNetProfit)}
                    valueClass={results.fiveYearNetProfit < 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}
                  />
                  <ResultRow
                    label="5-year ROI on capex"
                    value={
                      results.roiPctAt5Years != null
                        ? `${results.roiPctAt5Years >= 0 ? "+" : ""}${results.roiPctAt5Years.toFixed(1)}%`
                        : "—"
                    }
                  />
                </dl>
              </div>

              <div className="panel-elevated p-4">
                <div className="text-xs font-semibold text-muted-foreground">Cumulative net (undiscounted)</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {results.cumulativeNetAtYears.map(({ year, amount }) => (
                    <li key={year} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">After year {year}</span>
                      <span className={cn("font-mono tabular-nums", amount < 0 ? "text-[var(--color-warning)]" : "")}>
                        {fmtUsd0(amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 rounded-lg border border-border bg-[var(--color-secondary)]/30 px-3 py-2 text-[11px] text-muted-foreground">
                <Info className="size-3.5 shrink-0 mt-0.5" />
                <span>
                  Capex and rated throughput are catalog attributes. Volume follows your exams/day and days/year; utilization compares that schedule to rated daily capacity. Other inputs clamp to typical imaging ROI bands. Validate with finance, contracting, and the OEM.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function LockedMetric({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-1.5 rounded-md border border-dashed border-border bg-[var(--color-secondary)]/40 px-3 py-2 text-sm font-mono tabular-nums text-muted-foreground">
        {value}
      </div>
    </div>
  );
}

function DerivedScheduleMetric({
  utilizationPct,
  annualExams,
  catalogOemUptimePct,
}: {
  utilizationPct: number;
  annualExams: number;
  catalogOemUptimePct: number;
}) {
  return (
    <div className="rounded-md border border-border bg-[var(--color-accent)]/15 px-3 py-3">
      <div className="text-sm font-medium">Derived from your schedule</div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        Utilization = scheduled exams/day ÷ catalog rated throughput. Annual exam count = exams/day × operating days/year ({annualExams.toLocaleString()} exams/yr).
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-lg font-mono font-semibold tabular-nums">{utilizationPct.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">schedule vs rated daily capacity</span>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        Catalog OEM availability reference (not applied to volume here): {catalogOemUptimePct.toFixed(1)}%
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onCommit,
  min,
  max,
  prefix,
  suffix,
  formatThousands,
  integer,
  resetKey,
}: {
  label: string;
  hint?: string;
  value: number;
  onCommit: (n: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  formatThousands?: boolean;
  integer?: boolean;
  resetKey: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [resetKey]);

  const formattedCommitted =
    formatThousands === true
      ? Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
      : integer === true
        ? String(Math.round(value))
        : String(value);

  const display = draft !== null ? draft : formattedCommitted;

  const startEditing = () => {
    setDraft(
      formatThousands === true
        ? Math.round(value).toString()
        : integer === true
          ? String(Math.round(value))
          : String(value),
    );
  };

  const commitDraft = () => {
    if (draft === null) return;
    const raw = draft.trim().replace(/,/g, "");
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
      setDraft(null);
      return;
    }
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) {
      setDraft(null);
      return;
    }
    let v = n;
    if (integer) v = Math.round(v);
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    onCommit(v);
    setDraft(null);
  };

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-1.5 flex items-center gap-1.5">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onFocus={startEditing}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(null);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-border bg-[var(--color-input)] px-3 py-2 text-sm font-mono outline-none focus:border-primary"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-semibold tabular-nums text-right", valueClass)}>{value}</dd>
    </div>
  );
}
