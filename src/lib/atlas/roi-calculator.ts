import type { Device } from "./types";

/** User-editable scenario for a single machine (amounts in USD unless noted). */
export interface RoiScenarioInputs {
  capexUsd: number;
  examsPerDay: number;
  operatingDaysPerYear: number;
  revenuePerExamUsd: number;
  variableCostPerExamUsd: number;
  annualFixedCostsUsd: number;
}

export interface RoiScenarioResults {
  annualExamVolume: number;
  /** Scheduled daily load vs catalog rated throughput (0–100%). */
  scheduleUtilizationPct: number;
  netMarginPerExam: number;
  annualNetCash: number;
  paybackYears: number | null;
  breakEvenMonths: number | null;
  /** Simple undiscounted cumulative net after Y years: Y × annual net − capex. */
  cumulativeNetAtYears: { year: number; amount: number }[];
  fiveYearNetProfit: number;
  roiPctAt5Years: number | null;
}

/** Values fixed to the selected catalog device (OEM / spec–like assumptions). */
export interface RoiMachineAnchors {
  capexUsd: number;
  /** Catalog-rated daily exam capacity (upper bound for scenario volume). */
  ratedExamsPerDay: number;
  /** OEM/catalog availability figure (reference only; volume uses your schedule). */
  catalogOemUptimePct: number;
  /** Atlas reference direct/variable cost per exam for this system. */
  referenceVariableCostPerExamUsd: number;
}

export interface RoiNumericBounds {
  min: number;
  max: number;
}

/** Allowed ranges for site-specific levers (reimbursement, staffing, schedule). */
export interface RoiScenarioBounds {
  examsPerDay: RoiNumericBounds;
  operatingDaysPerYear: RoiNumericBounds;
  revenuePerExamUsd: RoiNumericBounds;
  variableCostPerExamUsd: RoiNumericBounds;
  annualFixedCostsUsd: RoiNumericBounds;
}

const PROJECTION_YEARS = [1, 3, 5, 10] as const;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Share of rated daily capacity you are scheduling (capped at 100%). */
export function scheduleUtilizationPct(examsPerDay: number, ratedExamsPerDay: number): number {
  if (ratedExamsPerDay <= 0) return 100;
  return Math.min(100, (examsPerDay / ratedExamsPerDay) * 100);
}

export function machineAnchorsFromDevice(d: Device): RoiMachineAnchors {
  const capexUsd = d.estCostUSDm * 1_000_000;
  return {
    capexUsd,
    ratedExamsPerDay: d.throughputPerDay,
    catalogOemUptimePct: d.uptimePct,
    referenceVariableCostPerExamUsd: d.costPerScanUSD,
  };
}

/**
 * Plausible edit ranges modeled after common imaging ROI worksheets:
 * — Acquisition cost is a system attribute.
 * — Daily volume is capped at OEM/catalog throughput; floor ~25% for low-utilization scenarios.
 * — Variable cost is banded around the reference per-exam cost (protocol / consumable variance).
 * — Revenue is banded around typical technical-component spreads vs that reference (payer mix).
 * — Fixed OPEX is banded as % of capital (service contract, allocated overhead).
 */
export function scenarioBoundsFromDevice(d: Device): RoiScenarioBounds {
  const anchors = machineAnchorsFromDevice(d);
  const ref = Math.max(1, anchors.referenceVariableCostPerExamUsd);
  const capex = Math.max(1, anchors.capexUsd);
  const rated = Math.max(1, anchors.ratedExamsPerDay);

  const examsMin = Math.max(1, Math.round(rated * 0.25));
  const examsMax = rated;

  return {
    examsPerDay: { min: Math.min(examsMin, examsMax), max: examsMax },
    operatingDaysPerYear: { min: 200, max: 365 },
    revenuePerExamUsd: {
      min: Math.round(ref * 1.02),
      max: Math.round(ref * 4.0),
    },
    variableCostPerExamUsd: {
      min: Math.max(1, Math.round(ref * 0.55)),
      max: Math.round(ref * 1.45),
    },
    annualFixedCostsUsd: {
      min: Math.round(capex * 0.05),
      max: Math.round(capex * 0.22),
    },
  };
}

/** Merge catalog-locked fields and clamp user levers to device-specific bounds. */
export function applyDeviceScenarioRules(inputs: RoiScenarioInputs, d: Device): RoiScenarioInputs {
  const anchors = machineAnchorsFromDevice(d);
  const b = scenarioBoundsFromDevice(d);

  return {
    capexUsd: anchors.capexUsd,
    examsPerDay: clamp(inputs.examsPerDay, b.examsPerDay.min, b.examsPerDay.max),
    operatingDaysPerYear: Math.round(clamp(inputs.operatingDaysPerYear, b.operatingDaysPerYear.min, b.operatingDaysPerYear.max)),
    revenuePerExamUsd: clamp(inputs.revenuePerExamUsd, b.revenuePerExamUsd.min, b.revenuePerExamUsd.max),
    variableCostPerExamUsd: clamp(inputs.variableCostPerExamUsd, b.variableCostPerExamUsd.min, b.variableCostPerExamUsd.max),
    annualFixedCostsUsd: clamp(inputs.annualFixedCostsUsd, b.annualFixedCostsUsd.min, b.annualFixedCostsUsd.max),
  };
}

export function defaultsFromDevice(d: Device): RoiScenarioInputs {
  const anchors = machineAnchorsFromDevice(d);
  const raw: RoiScenarioInputs = {
    capexUsd: anchors.capexUsd,
    examsPerDay: anchors.ratedExamsPerDay,
    operatingDaysPerYear: 260,
    revenuePerExamUsd: Math.round(anchors.referenceVariableCostPerExamUsd * 1.35),
    variableCostPerExamUsd: anchors.referenceVariableCostPerExamUsd,
    annualFixedCostsUsd: Math.round(anchors.capexUsd * 0.12),
  };
  return applyDeviceScenarioRules(raw, d);
}

export function computeRoi(inputs: RoiScenarioInputs, ratedExamsPerDay: number): RoiScenarioResults {
  const {
    capexUsd,
    examsPerDay,
    operatingDaysPerYear,
    revenuePerExamUsd,
    variableCostPerExamUsd,
    annualFixedCostsUsd,
  } = inputs;

  const annualExamVolume = Math.round(examsPerDay * operatingDaysPerYear);
  const util = scheduleUtilizationPct(examsPerDay, ratedExamsPerDay);
  const netMarginPerExam = revenuePerExamUsd - variableCostPerExamUsd;
  const annualNetCash = annualExamVolume * netMarginPerExam - annualFixedCostsUsd;

  const paybackYears = annualNetCash > 0 && capexUsd > 0 ? capexUsd / annualNetCash : null;
  const breakEvenMonths = paybackYears != null ? paybackYears * 12 : null;

  const cumulativeNetAtYears = PROJECTION_YEARS.map((year) => ({
    year,
    amount: year * annualNetCash - capexUsd,
  }));

  const fiveYearNetProfit = 5 * annualNetCash - capexUsd;
  const roiPctAt5Years = capexUsd > 0 ? (fiveYearNetProfit / capexUsd) * 100 : null;

  return {
    annualExamVolume,
    scheduleUtilizationPct: util,
    netMarginPerExam,
    annualNetCash,
    paybackYears,
    breakEvenMonths,
    cumulativeNetAtYears,
    fiveYearNetProfit,
    roiPctAt5Years,
  };
}
