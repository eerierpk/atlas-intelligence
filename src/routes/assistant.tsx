import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Send, Sparkles, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { ConfidenceBadge } from "@/components/atlas/DeviceCard";
import { buildAssistantReply, PROMPT_CHIPS } from "@/lib/atlas/ai";
import { getDevice } from "@/lib/atlas/data";
import type { AIMessage } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/assistant")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  component: AssistantPage,
});

function AssistantPage() {
  const { q } = Route.useSearch();
  const { upsertSession } = useAtlas();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setThinking(true);
    await new Promise(r => setTimeout(r, 650));
    const reply = buildAssistantReply(text);
    setMessages(m => {
      const next = [...m, reply];
      upsertSession({ id: sessionId.current, title: text.slice(0, 60), createdAt: Date.now(), messages: next });
      return next;
    });
    setThinking(false);
  };

  useEffect(() => { if (q) send(q); /* eslint-disable-next-line */ }, [q]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, thinking]);

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Sparkles className="size-5 text-[var(--color-primary)]" /> AI Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">Conversational decision support across the imaging catalog.</p>
        </div>
        <div className="chip"><ShieldCheck className="size-3" /> AI-generated guidance · not medical advice</div>
      </div>

      <div className="mt-5 panel-elevated flex flex-col h-[calc(100vh-220px)] min-h-[480px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="m-auto max-w-md text-center">
              <div className="size-12 mx-auto rounded-xl bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center"><Sparkles className="size-5 text-[var(--color-primary)]" /></div>
              <h3 className="mt-3 text-base font-semibold">Ask Atlas anything</h3>
              <p className="text-xs text-muted-foreground mt-1">Try one of these starting points.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {PROMPT_CHIPS.map(p => (
                  <button key={p} onClick={() => send(p)} className="chip hover:chip-accent">{p}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => m.role === "user" ? <UserBubble key={m.id} msg={m} /> : <AssistantBubble key={m.id} msg={m} />)}
          {thinking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              Atlas is reasoning…
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3 flex items-center gap-2">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about devices, scenarios, tradeoffs…"
            className="flex-1 h-10 px-3 rounded-md bg-[var(--color-input)] border border-border outline-none focus:border-primary text-sm"
          />
          <button className="h-10 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-1.5"><Send className="size-4" /> Send</button>
        </form>
      </div>
    </AppShell>
  );
}

function UserBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className="self-end max-w-[80%] rounded-xl rounded-br-sm bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 px-3.5 py-2.5 text-sm">{msg.content}</div>
  );
}

function AssistantBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className="self-start max-w-[88%] flex gap-3">
      <div className="size-8 rounded-md bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center shrink-0"><Sparkles className="size-4 text-[var(--color-primary)]" /></div>
      <div className="flex-1 glass-panel rounded-xl rounded-tl-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Atlas · response</div>
          {msg.confidence !== undefined && <ConfidenceBadge value={msg.confidence} />}
        </div>
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>

        {msg.references && msg.references.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Referenced devices</div>
            <div className="flex flex-wrap gap-1.5">
              {msg.references.map(id => {
                const d = getDevice(id);
                if (!d) return null;
                return (
                  <Link key={id} to="/devices/$deviceId" params={{ deviceId: id }} className="chip chip-accent hover:opacity-80">
                    {d.name} <ArrowRight className="size-3" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {msg.rationale && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">Decision trail · why</summary>
            <ul className="mt-2 flex flex-col gap-1 text-[11px] text-muted-foreground">
              {msg.rationale.map((r, i) => <li key={i} className="flex gap-2"><span className="text-[var(--color-primary)]">·</span>{r}</li>)}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
