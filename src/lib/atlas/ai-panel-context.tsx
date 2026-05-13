import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAtlas } from "@/lib/atlas/store";
import type { AIMessage } from "@/lib/atlas/types";

export type AgentId = "ask-atlas" | "intel-expert" | "ingest" | "scout";

export interface AgentMeta {
  id: AgentId;
  name: string;
  short: string;
  description: string;
  inputs: string[];
  guardrails: string[];
  expertOnly?: boolean;
}

export const AGENT_META: AgentMeta[] = [
  {
    id: "ask-atlas",
    name: "Ask Atlas",
    short: "General Q&A · catalog · navigation",
    description: "Base assistant for catalog questions, navigation help, and procurement scenarios.",
    inputs: ["Free text", "Device references", "Scenario chips"],
    guardrails: ["Catalog-grounded answers", "Confidence + provenance shown", "Not medical advice"],
  },
  {
    id: "intel-expert",
    name: "Intel Expert",
    short: "Human-in-the-loop content review",
    description: "Propose, accept, reject, and version edits to catalog content. Expert role required to commit changes.",
    inputs: ["Device target", "Edit fields", "Reviewer notes"],
    guardrails: ["Versioned edits", "Reject = no write", "Expert-only commit"],
    expertOnly: true,
  },
  {
    id: "ingest",
    name: "Document / video ingest",
    short: "Simulated extraction from PDFs, transcripts, URLs",
    description: "Pretend pipeline that extracts summaries, key bullets, and entities from uploaded files or public URLs.",
    inputs: ["File name", "URL", "Optional device context"],
    guardrails: ["Simulated parse", "No file content stored", "All sources labeled illustrative"],
  },
  {
    id: "scout",
    name: "Public web scout",
    short: "Simulated competitor scouting by device + region",
    description: "Generates an illustrative competitor set for a chosen device and region from simulated public sources.",
    inputs: ["Device", "Region", "Optional keywords"],
    guardrails: ["Simulated only", "Not verified competitive intelligence", "Citations are illustrative"],
  },
];

type ChatBuckets = Record<AgentId, AIMessage[]>;

const emptyBuckets = (): ChatBuckets => ({
  "ask-atlas": [],
  "intel-expert": [],
  ingest: [],
  scout: [],
});

export interface AiPanelUiValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  queueAndOpen: (message?: string, agentId?: AgentId) => void;
  pendingMessage: string | null;
  consumePending: () => void;
  agentId: AgentId;
  setAgentId: (a: AgentId) => void;
}

export interface AiChatPersistenceValue {
  chatMessages: AIMessage[];
  setChatMessages: Dispatch<SetStateAction<AIMessage[]>>;
  chatInput: string;
  setChatInput: Dispatch<SetStateAction<string>>;
  chatThinking: boolean;
  setChatThinking: Dispatch<SetStateAction<boolean>>;
  chatSessionId: string;
  resetChat: () => void;
}

const AiPanelUiCtx = createContext<AiPanelUiValue | null>(null);
const AiChatCtx = createContext<AiChatPersistenceValue | null>(null);

export function AiPanelProvider({ children }: { children: ReactNode }) {
  const { user } = useAtlas();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [agentId, setAgentIdState] = useState<AgentId>("ask-atlas");
  const [buckets, setBuckets] = useState<ChatBuckets>(() => emptyBuckets());
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(() => crypto.randomUUID());

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const setAgentId = useCallback((a: AgentId) => {
    setAgentIdState(a);
    setChatInput("");
    setChatThinking(false);
  }, []);

  const queueAndOpen = useCallback((message?: string, target?: AgentId) => {
    if (target) setAgentId(target);
    if (message?.trim()) setPendingMessage(message.trim());
    setIsOpen(true);
  }, [setAgentId]);

  const consumePending = useCallback(() => setPendingMessage(null), []);

  const resetChat = useCallback(() => {
    setBuckets(emptyBuckets());
    setChatInput("");
    setChatThinking(false);
    setChatSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!user) resetChat();
  }, [user, resetChat]);

  const chatMessages = buckets[agentId];

  const setChatMessages: Dispatch<SetStateAction<AIMessage[]>> = useCallback(
    (updater) => {
      setBuckets((prev) => {
        const cur = prev[agentId];
        const next = typeof updater === "function" ? (updater as (m: AIMessage[]) => AIMessage[])(cur) : updater;
        return { ...prev, [agentId]: next };
      });
    },
    [agentId],
  );

  const uiValue = useMemo<AiPanelUiValue>(
    () => ({
      isOpen, open, close, toggle, queueAndOpen,
      pendingMessage, consumePending, agentId, setAgentId,
    }),
    [isOpen, open, close, toggle, queueAndOpen, pendingMessage, consumePending, agentId, setAgentId],
  );

  const chatValue = useMemo<AiChatPersistenceValue>(
    () => ({
      chatMessages, setChatMessages, chatInput, setChatInput,
      chatThinking, setChatThinking, chatSessionId, resetChat,
    }),
    [chatMessages, setChatMessages, chatInput, chatThinking, chatSessionId, resetChat],
  );

  return (
    <AiPanelUiCtx.Provider value={uiValue}>
      <AiChatCtx.Provider value={chatValue}>{children}</AiChatCtx.Provider>
    </AiPanelUiCtx.Provider>
  );
}

export function useAiPanelUi() {
  const ctx = useContext(AiPanelUiCtx);
  if (!ctx) throw new Error("useAiPanelUi must be used inside AiPanelProvider");
  return ctx;
}

export function useAiPanel(): AiPanelUiValue & AiChatPersistenceValue {
  const ui = useAiPanelUi();
  const chat = useContext(AiChatCtx);
  if (!chat) throw new Error("useAiPanel must be used inside AiPanelProvider");
  return { ...ui, ...chat };
}
