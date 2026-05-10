import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, PanelRightClose, Send, Sparkles, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfidenceBadge } from "@/components/atlas/DeviceCard";
import { buildAssistantReply, buildDeviceReviewMessage, PROMPT_CHIPS } from "@/lib/atlas/ai";
import { useAiPanel } from "@/lib/atlas/ai-panel-context";
import { getDevice } from "@/lib/atlas/data";
import type { AIMessage, DeviceReviewSnapshot } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

export function AtlasChatPanel() {
  const {
    close,
    pendingMessage,
    consumePending,
    chatMessages: messages,
    setChatMessages: setMessages,
    chatInput: input,
    setChatInput: setInput,
    chatThinking: thinking,
    setChatThinking: setThinking,
    chatSessionId,
  } = useAiPanel();
  const { upsertSession } = useAtlas();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const userMsg: AIMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: Date.now() };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setThinking(true);
      await new Promise((r) => setTimeout(r, 650));
      const deviceMatch = /^\/devices\/([^/]+)\/?$/.exec(pathname);
      const deviceReviewReply = deviceMatch?.[1] ? buildDeviceReviewMessage(deviceMatch[1]) : null;
      const reply = deviceReviewReply ?? buildAssistantReply(text);
      setMessages((m) => {
        const next = [...m, reply];
        upsertSession({ id: chatSessionId, title: text.slice(0, 60), createdAt: Date.now(), messages: next });
        return next;
      });
      setThinking(false);
    },
    [pathname, upsertSession, chatSessionId, setMessages, setInput, setThinking]
  );

  useEffect(() => {
    if (!pendingMessage) return;
    const t = pendingMessage;
    consumePending();
    void send(t);
  }, [pendingMessage, consumePending, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-surface)]/80">
      <div className="shrink-0 border-b border-border p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-[var(--color-primary)] shrink-0" />
            Ask Atlas
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Equipment catalog · planning intelligence only</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="size-9 shrink-0 grid place-items-center rounded-md border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
          title="Close panel"
          aria-label="Close AI panel"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      <div className="shrink-0 px-3 pt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3 shrink-0" />
          Not medical advice
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 && !thinking && (
          <div className="my-auto max-w-full text-center px-1 py-6">
            <div className="size-10 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center">
              <Sparkles className="size-4 text-[var(--color-primary)]" />
            </div>
            <h3 className="mt-2 text-sm font-semibold">Ask anything</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Try a starter prompt.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {PROMPT_CHIPS.map((p) => (
                <button key={p} type="button" onClick={() => void send(p)} className="chip hover:chip-accent text-[11px]">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} msg={m} /> : <AssistantBubble key={m.id} msg={m} />))}
        {thinking && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Atlas is reasoning…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="shrink-0 border-t border-border p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about devices, scenarios, tradeoffs…"
          className="flex-1 min-w-0 h-9 px-2.5 rounded-md bg-[var(--color-input)] border border-border outline-none focus:border-primary text-sm"
        />
        <button type="submit" className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-1 shrink-0">
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}

function UserBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className="self-end max-w-[90%] rounded-lg rounded-br-sm bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 px-3 py-2 text-sm">{msg.content}</div>
  );
}

function DeviceReviewStream({ review }: { review: DeviceReviewSnapshot }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(1);
    const t2 = window.setTimeout(() => setStep(2), 420);
    const t3 = window.setTimeout(() => setStep(3), 840);
    const t4 = window.setTimeout(() => setStep(4), 1280);
    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [review.deviceId]);

  return (
    <div className="mt-2 flex flex-col gap-2.5">
      {step >= 1 && (
        <div className="glass-panel rounded-lg p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold flex items-center gap-1.5 min-w-0">
              <Sparkles className="size-3.5 shrink-0 text-[var(--color-primary)]" /> AI Summary
            </div>
            <ConfidenceBadge value={review.confidence} className="shrink-0" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{review.summary}</p>
        </div>
      )}
      {step >= 2 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Strengths</div>
          <ul className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
            {review.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-[var(--color-success)] shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {step >= 3 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Tradeoffs</div>
          <ul className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
            {review.tradeoffs.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-[var(--color-warning)] shrink-0">!</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {step >= 4 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Provenance</div>
          <div className="flex flex-wrap gap-1">
            {review.sources.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">AI-generated guidance, not medical advice.</p>
        </div>
      )}
    </div>
  );
}

function AssistantBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className="self-start max-w-[95%] flex gap-2">
      <div className="size-7 rounded-md bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center shrink-0">
        <Sparkles className="size-3.5 text-[var(--color-primary)]" />
      </div>
      <div className="flex-1 min-w-0 glass-panel rounded-lg rounded-tl-sm p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Atlas</div>
          {msg.confidence !== undefined && !msg.deviceReview && <ConfidenceBadge value={msg.confidence} />}
        </div>
        {msg.deviceReview ? (
          <>
            <p className="text-sm leading-relaxed text-foreground/95">{msg.content}</p>
            <DeviceReviewStream review={msg.deviceReview} />
          </>
        ) : (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
        )}

        {msg.references && msg.references.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Referenced devices</div>
            <div className="flex flex-wrap gap-1">
              {msg.references.map((id) => {
                const d = getDevice(id);
                if (!d) return null;
                return (
                  <Link key={id} to="/devices/$deviceId" params={{ deviceId: id }} className="chip chip-accent hover:opacity-80 text-[11px]">
                    {d.name} <ArrowRight className="size-3" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {msg.rationale && (
          <details className="mt-2 group">
            <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">Decision trail</summary>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-muted-foreground">
              {msg.rationale.map((r, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-[var(--color-primary)]">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
