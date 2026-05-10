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

/** Open/close and queued prompts — changes here should not depend on chat transcript. */
export interface AiPanelUiValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  queueAndOpen: (message?: string) => void;
  pendingMessage: string | null;
  consumePending: () => void;
}

/** Conversation state — survives route changes (provider wraps <Outlet />). */
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
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(() => crypto.randomUUID());

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const queueAndOpen = useCallback((message?: string) => {
    if (message?.trim()) setPendingMessage(message.trim());
    setIsOpen(true);
  }, []);

  const consumePending = useCallback(() => setPendingMessage(null), []);

  const resetChat = useCallback(() => {
    setChatMessages([]);
    setChatInput("");
    setChatThinking(false);
    setChatSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!user) resetChat();
  }, [user, resetChat]);

  const uiValue = useMemo<AiPanelUiValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      queueAndOpen,
      pendingMessage,
      consumePending,
    }),
    [isOpen, open, close, toggle, queueAndOpen, pendingMessage, consumePending],
  );

  const chatValue = useMemo<AiChatPersistenceValue>(
    () => ({
      chatMessages,
      setChatMessages,
      chatInput,
      setChatInput,
      chatThinking,
      setChatThinking,
      chatSessionId,
      resetChat,
    }),
    [chatMessages, chatInput, chatThinking, chatSessionId, resetChat],
  );

  return (
    <AiPanelUiCtx.Provider value={uiValue}>
      <AiChatCtx.Provider value={chatValue}>{children}</AiChatCtx.Provider>
    </AiPanelUiCtx.Provider>
  );
}

/** Panel visibility & queue only — use in AppShell / cards so chat typing does not re-render the shell. */
export function useAiPanelUi() {
  const ctx = useContext(AiPanelUiCtx);
  if (!ctx) throw new Error("useAiPanelUi must be used inside AiPanelProvider");
  return ctx;
}

/** Full panel + persisted chat (Ask Atlas). */
export function useAiPanel(): AiPanelUiValue & AiChatPersistenceValue {
  const ui = useAiPanelUi();
  const chat = useContext(AiChatCtx);
  if (!chat) throw new Error("useAiPanel must be used inside AiPanelProvider");
  return { ...ui, ...chat };
}
