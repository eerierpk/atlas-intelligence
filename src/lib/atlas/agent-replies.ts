import type { AgentId } from "./ai-panel-context";
import { buildAssistantReply } from "./ai";
import { DEVICES } from "./data";
import type { AIMessage } from "./types";

function id() { return crypto.randomUUID(); }
function now() { return Date.now(); }

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

export function buildAgentReply(agent: AgentId, prompt: string, attachments: string[]): AIMessage {
  if (agent === "ask-atlas") return buildAssistantReply(prompt);

  if (agent === "ingest") {
    const src = attachments[0] ?? "uploaded-document.pdf";
    const isUrl = /^https?:\/\//i.test(src);
    const content = [
      `**Summary**`,
      `Simulated extraction completed for ${isUrl ? "the linked source" : "the uploaded document"} \`${src}\`. Identified product context, key claims, and entity references.`,
      ``,
      `**Key bullets**`,
      `- Detected ${Math.floor(Math.random() * 8) + 6} candidate entities (vendors, modalities, sites)`,
      `- Extracted ${Math.floor(Math.random() * 5) + 3} structured claims with surrounding context`,
      `- Flagged ${Math.floor(Math.random() * 2) + 1} statement(s) requiring expert review`,
      ``,
      `**Sources (simulated)**`,
      `- ${src}`,
      `- Atlas catalog cross-references`,
      ``,
      `**Confidence**: 72%`,
      ``,
      `**Next steps**`,
      `- Route flagged claims to Intel Expert agent`,
      `- Attach extraction to a saved comparison`,
    ].join("\n");
    return { id: id(), role: "assistant", createdAt: now(), content, confidence: 72, rationale: ["Simulated OCR/transcript pipeline", "Entity recognition mocked", "Outputs illustrative only"] };
  }

  if (agent === "scout") {
    const region = (prompt.match(/(EU|US|APAC|MEA|LATAM|North America|Europe|Asia)/i)?.[0] ?? "Global");
    const ref = DEVICES.slice(0, 4);
    const lines = ref.map(d => `| ${d.vendor} | ${d.name} | ${d.modality} | ${d.budgetTier} | ~$${d.estCostUSDm.toFixed(1)}M |`).join("\n");
    const content = [
      `**Summary**`,
      `Simulated competitor scan in **${region}** for the requested system. Returned ${ref.length} comparable platforms.`,
      ``,
      `**Competitor set (illustrative)**`,
      `| Vendor | Model | Modality | Tier | Est. cost |`,
      `|---|---|---|---|---|`,
      lines,
      ``,
      `**Sources (simulated)**`,
      `- Vendor public datasheets`,
      `- Industry analyst summaries`,
      ``,
      `**Confidence**: 64%`,
      ``,
      `**Next steps**`,
      `- Add 2 candidates to comparison`,
      `- Run regional ROI scenarios`,
    ].join("\n");
    return { id: id(), role: "assistant", createdAt: now(), content, references: ref.map(r => r.id), confidence: 64, rationale: [`Region inferred: ${region}`, "Synthetic competitor list", "Not verified competitive intelligence"] };
  }

  // intel-expert
  const target = DEVICES[0];
  const content = [
    `**Summary**`,
    `Drafted edits for **${target.name}** based on prompt: _"${prompt.slice(0, 120)}"_`,
    ``,
    `**Proposed changes**`,
    `- Tagline refinement (1 sentence)`,
    `- Clinical positioning rewrite`,
    `- AI workflow notes — added 2 bullets`,
    ``,
    `**Sources (simulated)**`,
    pick(target.sources, 3).map(s => `- ${s}`).join("\n"),
    ``,
    `**Confidence**: 58% (requires expert review)`,
    ``,
    `**Next steps**`,
    `- Open Intel Expert workspace to accept / reject`,
    `- Commit creates a new content version`,
  ].join("\n");
  return { id: id(), role: "assistant", createdAt: now(), content, references: [target.id], confidence: 58, rationale: ["HITL agent: no auto-commit", "Versioned edit draft", "Expert role required to publish"] };
}
