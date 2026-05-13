import type { AgentId } from "./ai-panel-context";
import { DEVICES, getDevice } from "./data";
import { getCompetitors } from "@/lib/fixtures/competitors";
import type { AIMessage, Device } from "./types";

function id() {
  return crypto.randomUUID();
}
function now() {
  return Date.now();
}

function assistant(content: string, extra?: Partial<AIMessage>): AIMessage {
  return { id: id(), role: "assistant", createdAt: now(), content, ...extra };
}

/** Deterministic-ish “noise” from inputs so repeats feel slightly varied without Math.random flicker. */
function jitter(prompt: string, attachments: string[], i: number): number {
  const s = (prompt.length + attachments.join("").length + i * 13) % 7;
  return s;
}

function resolveDeviceFromContext(prompt: string, attachments: string[]): Device {
  const devRef = attachments.find((c) => /^dev-/.test(c));
  if (devRef) {
    const d = getDevice(devRef);
    if (d) return d;
  }
  const p = prompt.toLowerCase();
  const byName = DEVICES.find((d) => p.includes(d.name.toLowerCase()));
  if (byName) return byName;
  if (/\bmri\b|magnetic|1\.5t|3t\b/.test(p)) return DEVICES.find((d) => d.modality === "MRI") ?? DEVICES[0];
  if (/\bct\b|tomography|slice|detector/.test(p)) return DEVICES.find((d) => d.modality === "CT") ?? DEVICES[0];
  return DEVICES[0];
}

function inferRegion(prompt: string): string {
  const m = prompt.match(/(EU|US|APAC|MEA|LATAM|North America|Europe|Asia|UK|Germany|France)/i);
  if (m) return m[0];
  if (/tender|procurement|nhs|eu\b/i.test(prompt)) return "EU";
  return "Global";
}

export interface SimulatedChatStep {
  delayMs: number;
  message: AIMessage;
}

/**
 * Multi-turn, chat-shaped simulation for specialist agents (not Ask Atlas).
 * Ask Atlas continues to use {@link buildAssistantReply} in a single bubble.
 */
export function getSpecialistSimulationSequence(
  agent: Exclude<AgentId, "ask-atlas">,
  prompt: string,
  attachments: string[],
): SimulatedChatStep[] {
  if (agent === "ingest") return buildIngestSequence(prompt, attachments);
  if (agent === "scout") return buildScoutSequence(prompt, attachments);
  return buildIntelExpertSequence(prompt, attachments);
}

function buildIngestSequence(prompt: string, attachments: string[]): SimulatedChatStep[] {
  const src = attachments[0] ?? (prompt.trim() ? "message-only-input" : "no-source-chip.pdf");
  const isUrl = /^https?:\/\//i.test(src);
  const j = jitter(prompt, attachments, 0);
  const entities = 5 + j;
  const claims = 3 + (j % 4);
  const flags = 1 + (j % 2);

  const lines: SimulatedChatStep[] = [
    {
      delayMs: 0,
      message: assistant(
        isUrl
          ? "Got it — I’ll run this as a **simulated** ingest. I’m not downloading binaries in the browser; I’ll pretend I fetched the public text layer from your URL."
          : `Okay. I’m lining up a **mock** parse for \`${src}\`. Nothing is uploaded to a real backend here — it’s all front-end theater.`,
      ),
    },
    {
      delayMs: 480,
      message: assistant(
        prompt.trim().length < 8
          ? "Quick heads-up: your message is pretty short. If you add 1–2 sentences on what you care about (pricing claims, clinical positioning, install base…), the next pass can pretend to weight sections differently."
          : "Nice — there’s enough free text to bias the pretend scoring toward the sections you seem to care about.",
      ),
    },
    {
      delayMs: 560,
      message: assistant(
        "Pass **A** done: normalized headings, stripped repeated boilerplate, and chunked tables so rows don’t get glued together in the fake transcript.",
      ),
    },
    {
      delayMs: 620,
      message: assistant(
        `Pass **B**: I’m labeling strings that look like **vendors**, **modalities**, and **sites**. Rough count in this simulation: **${entities}** candidates, **${claims}** “structured-ish” claims with a line of context each.`,
      ),
    },
    {
      delayMs: 520,
      message: assistant(
        flags > 1
          ? `I’m not auto-trusting everything. **${flags}** lines read like forward-looking marketing or reimbursement-ish language — I’d route those to **Intel Expert** instead of treating them as facts.`
          : "One sentence looks “too clean” to be a neutral spec line — I flagged it for human review in the pretend workflow.",
      ),
    },
    {
      delayMs: 640,
      message: assistant(
        [
          `If this were real, next I’d attach a structured bundle to a comparison or an expert queue.`,
          ``,
          `Illustrative confidence: **72%** (demo).`,
          `Pretend sources: \`${src}\`, plus Atlas catalog cross-checks.`,
        ].join("\n"),
        {
          confidence: 72,
          rationale: [
            "Simulated OCR/transcript pipeline",
            "No file bytes persisted in this prototype",
            "Entity counts are illustrative, not extracted",
          ],
        },
      ),
    },
  ];
  return lines;
}

function buildScoutSequence(prompt: string, attachments: string[]): SimulatedChatStep[] {
  const anchor = resolveDeviceFromContext(prompt, attachments);
  const region = inferRegion(prompt);
  const rows = getCompetitors(anchor.id, region === "Global" ? undefined : region);
  const tableLines = rows.length
    ? [
        `Here’s a **toy** competitor snapshot anchored on **${anchor.name}** (${anchor.vendor}) for **${region}**. Same modality bucket; not verified CI.`,
        ``,
        `| Product | Vendor | Differentiator (vendor-stated) | Last “seen” |`,
        `|---|---|---|---|`,
        ...rows.map((r) => `| ${r.product} | ${r.vendor} | ${r.differentiator} | ${r.lastSeen} |`),
        ``,
        `If you want this tighter, tell me a **region** and (optionally) chip a **device** from the catalog.`,
      ].join("\n")
    : `I couldn’t build a peer table for **${anchor.name}** in this stub dataset (no same-modality peers). Try another anchor or mention MRI/CT in your message.`;

  return [
    {
      delayMs: 0,
      message: assistant(
        `Starting a **public web scout** run (still 100% simulated). I’ll behave like I’m scanning public datasheets, tenders, and marketing pages — not logging into paywalled analyst portals.`,
      ),
    },
    {
      delayMs: 520,
      message: assistant(
        `I’m using **${anchor.name}** as the anchor${attachments.some((a) => /^dev-/.test(a)) ? " (from your device chip)" : " — tell me another catalog device by name if that’s wrong"}.`,
      ),
    },
    {
      delayMs: 580,
      message: assistant(
        region === "Global"
          ? "Region isn’t pinned yet, so I’m keeping the peer set **global**. Mention EU/US/APAC (or a country) if you want the pretend crawl biased."
          : `Region lock: **${region}**. I’m pretending to de-duplicate press releases + tender snippets that mention the same SKU under different strings.`,
      ),
    },
    {
      delayMs: 640,
      message: assistant(
        rows.length
          ? `I’ve got **${rows.length}** peer rows that plausibly show up in the same procurement conversations (still synthetic).`
          : "Hmm — I couldn’t fabricate a peer list for that anchor in this stub dataset. Try another device.",
      ),
    },
    {
      delayMs: 720,
      message: assistant(tableLines, {
        references: [anchor.id],
        confidence: rows.length ? 64 : 35,
        rationale: [
          `Anchor device: ${anchor.name}`,
          `Region: ${region}`,
          "Competitor rows generated from catalog fixtures — not independent research",
        ],
      }),
    },
  ];
}

function buildIntelExpertSequence(prompt: string, attachments: string[]): SimulatedChatStep[] {
  const target = resolveDeviceFromContext(prompt, attachments);
  const snippet = prompt.trim().slice(0, 140) || "(no extra reviewer notes in this message)";
  const sources = target.sources.slice(0, 3);

  return [
    {
      delayMs: 0,
      message: assistant(
        "Hey — Intel Expert here (simulated). I’m not going to silently overwrite the catalog; I’ll only stage edits for you to eyeball.",
      ),
    },
    {
      delayMs: 460,
      message: assistant(
        `I pulled the live card for **${target.name}** (${target.vendor}, ${target.modality}).`,
      ),
    },
    {
      delayMs: 540,
      message: assistant(`You wrote:\n\n> ${snippet}${prompt.length > 140 ? "…" : ""}\n\nI’m mapping that to: tagline tone, clinical positioning, and AI workflow notes — not hardware specs unless you explicitly asked.`),
    },
    {
      delayMs: 600,
      message: assistant(
        [
          "Draft bundle (illustrative):",
          `- **Tagline**: shorten to one confident sentence; remove duplicated “AI” adjectives.`,
          `- **Clinical positioning**: add a clearer “best for / not optimized for” pair without inventing indications.`,
          `- **AI workflow notes**: add two bullets about where automation helps operators vs where it’s only analytics.`,
        ].join("\n"),
      ),
    },
    {
      delayMs: 680,
      message: assistant(
        [
          "Nothing is committed from this chat. Open the **Intel Expert** workspace when you want the side-by-side catalog vs proposed fields and a proper submit/draft flow.",
          "",
          sources.length ? `Sources I’m pretending to lean on:\n${sources.map((s) => `- ${s}`).join("\n")}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        {
          references: [target.id],
          confidence: 58,
          rationale: [
            "HITL: staged edits only",
            "Expert role still required to publish",
            "Diff is illustrative in this panel",
          ],
        },
      ),
    },
  ];
}
