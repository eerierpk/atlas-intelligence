import { DEVICES, getDevice } from "./data";
import type { AIMessage, ClinicalTag, Device, DeviceReviewSnapshot, Modality } from "./types";

export interface ScenarioWeights {
  budget: number; // higher = more budget-conscious
  throughput: number; // higher = needs more throughput
  ai: number;
  clinical: ClinicalTag[];
  modality?: Modality;
}

export function scoreDevice(d: Device, w: ScenarioWeights): number {
  let score = 0;
  // clinical match
  const clinicalHits = w.clinical.filter((t) => d.clinicalTags.includes(t)).length;
  score += clinicalHits * 18;
  // modality
  if (w.modality && d.modality !== w.modality) score -= 60;
  // ai maturity
  score += d.aiMaturity * w.ai * 1.6;
  // throughput
  score += (d.throughputPerDay / 110) * w.throughput * 12;
  // budget (cheaper better when budget weight high)
  const costNorm = 1 - Math.min(d.estCostUSDm / 3, 1);
  score += costNorm * w.budget * 14;
  // uptime + maintenance
  score += (d.uptimePct - 97) * 6;
  score -= (d.maintenanceBurden - 2) * 2;
  return Math.round(score * 10) / 10;
}

export function rankDevices(w: ScenarioWeights, limit = 4) {
  return [...DEVICES]
    .map((d) => ({ device: d, score: scoreDevice(d, w) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const CLINICAL_SYNONYMS: Record<string, ClinicalTag> = {
  oncology: "oncology", cancer: "oncology", tumor: "oncology",
  neuro: "neuro", neurology: "neuro", brain: "neuro", stroke: "neuro",
  trauma: "trauma", er: "emergency", emergency: "emergency",
  cardiac: "cardiac", heart: "cardiac", coronary: "cardiac",
  pediatric: "pediatrics", pediatrics: "pediatrics", children: "pediatrics",
  msk: "musculoskeletal", musculoskeletal: "musculoskeletal", ortho: "musculoskeletal",
  abdominal: "abdominal", abdomen: "abdominal", liver: "abdominal",
};

export function parsePrompt(prompt: string): ScenarioWeights {
  const p = prompt.toLowerCase();
  const clinical = Array.from(new Set(
    Object.entries(CLINICAL_SYNONYMS)
      .filter(([k]) => p.includes(k))
      .map(([, v]) => v)
  ));

  let modality: Modality | undefined;
  if (/\bmri\b|magnetic|t1|t2/.test(p)) modality = "MRI";
  if (/\bct\b|computed tomography|slice/.test(p)) modality = "CT";

  const budget = /low budget|cost-?eff|affordable|cheap|community|entry/.test(p) ? 8 : /premium|flagship|top/.test(p) ? 1 : 5;
  const throughput = /throughput|high volume|busy|er|emergency|trauma/.test(p) ? 8 : 4;
  const ai = /ai|deep learning|automation|workflow|smart/.test(p) ? 8 : 5;

  return { budget, throughput, ai, clinical, modality };
}

export function buildAssistantReply(prompt: string): AIMessage {
  const w = parsePrompt(prompt);
  const ranked = rankDevices(w, 3);
  const top = ranked[0];
  if (!top) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      createdAt: Date.now(),
      content: "I couldn't match this query to any system in the catalog. Try referencing a clinical use case (oncology, neuro, cardiac, trauma) or an equipment category (MRI, CT, ultrasound, X-ray, and similar).",
      confidence: 30,
      rationale: ["No matching scenario tags detected."],
    };
  }

  const device = top.device;
  const otherIds = ranked.slice(1).map(r => r.device.id);
  const clinicalText = w.clinical.length ? w.clinical.join(", ") : "multi-specialty hospital operations";
  const modalityText = w.modality ?? "multiple equipment categories";
  const tradeoffs: string[] = [];
  if (device.budgetTier === "Flagship" || device.budgetTier === "Premium") tradeoffs.push(`Higher capital cost (~$${device.estCostUSDm.toFixed(1)}M) and ${device.setupWeeks}-week siting timeline.`);
  if (device.complexity === "High") tradeoffs.push("Requires advanced operator training and structured QA program.");
  if (device.maintenanceBurden >= 4) tradeoffs.push("Above-average maintenance burden — plan for service contract uplift.");
  if (!tradeoffs.length) tradeoffs.push("Balanced platform — minimal structural tradeoffs at this tier.");

  const content = [
    `Recommendation: **${device.name}** by ${device.vendor}.`,
    ``,
    `For ${clinicalText} workloads ${w.modality ? `with emphasis on ${w.modality}` : "across capital medical equipment in the catalog"}, this system scores highest in the Atlas decision model. ${device.tagline}`,
    ``,
    `Why it fits:`,
    `- AI maturity ${device.aiMaturity}/5 (${device.aiCapabilities.slice(0, 2).join(", ")})`,
    `- Throughput ~${device.throughputPerDay} exams/day at ${device.uptimePct}% uptime`,
    `- Cost-per-scan ~$${device.costPerScanUSD}, ROI window ~${device.roiYears} yrs`,
    ``,
    `Also consider: ${ranked.slice(1).map(r => r.device.name).join(", ")}.`,
  ].join("\n");

  const confidence = Math.min(96, 60 + top.score / 4);

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    createdAt: Date.now(),
    content,
    references: [device.id, ...otherIds],
    rationale: [
      `Scenario tags: ${clinicalText}`,
      `Equipment scope: ${modalityText}`,
      `Weighted by AI(${w.ai}), throughput(${w.throughput}), budget(${w.budget})`,
      ...tradeoffs.map(t => `Tradeoff: ${t}`),
    ],
    confidence: Math.round(confidence),
  };
}

export const PROMPT_CHIPS = [
  "Best MRI for neuro + oncology with moderate budget",
  "Compare flagship CT platforms for trauma workflow",
  "Highest-throughput CT for a busy ER",
  "Cost-efficient 1.5T MRI for community hospital",
  "Top AI-mature flagship for cardiac CT",
  "Pediatric-friendly MRI options",
];

export function deviceById(id: string) {
  return getDevice(id);
}

export function buildDeviceReviewSnapshot(device: Device): DeviceReviewSnapshot {
  const strengths = [
    `AI maturity ${device.aiMaturity}/5 with ${device.aiCapabilities.length} flagship capabilities`,
    `Throughput ${device.throughputPerDay}/day at ${device.uptimePct}% uptime`,
    `Strong fit for ${device.clinicalTags.slice(0, 3).join(", ")}`,
  ];
  const tradeoffs: string[] = [];
  if (device.budgetTier === "Flagship" || device.budgetTier === "Premium") {
    tradeoffs.push(`Higher capex (~$${device.estCostUSDm.toFixed(1)}M)`);
  }
  if (device.complexity === "High") tradeoffs.push("Requires advanced operator training");
  if (device.maintenanceBurden >= 4) tradeoffs.push("Above-average maintenance burden");
  if (!tradeoffs.length) tradeoffs.push("Balanced platform — minimal structural tradeoffs");
  const summary = `${device.name} is positioned in the ${device.budgetTier.toLowerCase()} tier with strong alignment to ${device.clinicalTags.slice(0, 2).join(" and ")} workflows. Atlas confidence is anchored on vendor specs and benchmark patterns.`;
  return {
    deviceId: device.id,
    summary,
    strengths,
    tradeoffs,
    sources: device.sources,
    confidence: device.confidence,
  };
}

/** Assistant turn that mirrors the former device-page review rail. */
export function buildDeviceReviewMessage(deviceId: string): AIMessage | null {
  const device = getDevice(deviceId);
  if (!device) return null;
  const deviceReview = buildDeviceReviewSnapshot(device);
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    createdAt: Date.now(),
    content:
      "Here’s a structured procurement review for this system, synthesized from catalog signals and benchmark patterns.",
    references: [device.id],
    confidence: device.confidence,
    deviceReview,
  };
}
