import type { AgentId } from "./ai-panel-context";
import { buildAssistantReply } from "./ai";
import type { AIMessage } from "./types";

/** Single-turn catalog Q&A only. Specialist agents use {@link getSpecialistSimulationSequence} in `agent-simulation.ts`. */
export function buildAgentReply(agent: AgentId, prompt: string, _attachments: string[]): AIMessage {
  if (agent === "ask-atlas") return buildAssistantReply(prompt);
  return buildAssistantReply(
    `[Internal] Unknown agent "${agent}" — falling back to catalog Q&A. Use the specialist simulation path in the AI panel.`,
  );
}
