import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Lock, PanelRightClose, Paperclip, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfidenceBadge } from "@/components/atlas/DeviceCard";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { buildDeviceReviewMessage, PROMPT_CHIPS } from "@/lib/atlas/ai";
import { AGENT_META, useAiPanel, type AgentId } from "@/lib/atlas/ai-panel-context";
import { getSpecialistSimulationSequence } from "@/lib/atlas/agent-simulation";
import { buildAgentReply } from "@/lib/atlas/agent-replies";
import { getDevice } from "@/lib/atlas/data";
import { can } from "@/lib/atlas/permissions";
import { useAtlas } from "@/lib/atlas/store";
import type { AIMessage, DeviceReviewSnapshot } from "@/lib/atlas/types";

const AGENT_OPTIONS = AGENT_META.map(a => ({ value: a.id, label: a.name, aliases: [a.short] }));

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
    agentId,
    setAgentId,
  } = useAiPanel();
  const { user, upsertSession } = useAtlas();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const agent = useMemo(() => AGENT_META.find(a => a.id === agentId)!, [agentId]);
  const expertLocked = agent.expertOnly && !can(user?.userRole, "approve:content");

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const chips = attachments.slice();
      const userMsg: AIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        references: chips.length ? chips.filter(c => /^dev-/.test(c)) : undefined,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setAttachments([]);
      setThinking(true);
      await new Promise((r) => setTimeout(r, 650));
      const deviceMatch = /^\/devices\/([^/]+)\/?$/.exec(pathname);
      const deviceReviewReply = agent.id === "ask-atlas" && deviceMatch?.[1] ? buildDeviceReviewMessage(deviceMatch[1]) : null;

      if (deviceReviewReply) {
        setMessages((m) => {
          const next = [...m, deviceReviewReply];
          upsertSession({ id: chatSessionId, title: `${agent.name}: ${text.slice(0, 50)}`, createdAt: Date.now(), messages: next });
          return next;
        });
        setThinking(false);
        return;
      }

      if (agent.id === "ask-atlas") {
        const reply = buildAgentReply(agent.id, text, chips);
        setMessages((m) => {
          const next = [...m, reply];
          upsertSession({ id: chatSessionId, title: `${agent.name}: ${text.slice(0, 50)}`, createdAt: Date.now(), messages: next });
          return next;
        });
        setThinking(false);
        return;
      }

      const sequence = getSpecialistSimulationSequence(agent.id, text, chips);
      setThinking(false);
      for (const { delayMs, message } of sequence) {
        await new Promise((r) => setTimeout(r, delayMs));
        setMessages((m) => [...m, message]);
      }
      setMessages((m) => {
        upsertSession({ id: chatSessionId, title: `${agent.name}: ${text.slice(0, 50)}`, createdAt: Date.now(), messages: m });
        return m;
      });
    },
    [pathname, upsertSession, chatSessionId, setMessages, setInput, setThinking, attachments, agent],
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

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAttachments(a => [...a, f.name]);
    if (fileRef.current) fileRef.current.value = "";
  };
  const addUrl = () => {
    if (urlDraft.trim()) { setAttachments(a => [...a, urlDraft.trim()]); setUrlDraft(""); setShowUrl(false); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-surface)]/80">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Sparkles className="size-4 text-[var(--color-primary)] shrink-0" />
            Ask AI
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

      {/* Agent switcher */}
      <div className="shrink-0 px-3 pt-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Agent</div>
        <SearchableCombobox
          options={AGENT_OPTIONS}
          value={agentId}
          onChange={(v) => v && setAgentId(v as AgentId)}
          placeholder="Select agent"
          searchPlaceholder="Switch agent…"
          allowClear={false}
          triggerClassName="!min-h-10 !py-1"
        />
        <button
          type="button"
          onClick={() => setHowOpen(o => !o)}
          aria-expanded={howOpen}
          className="mt-2 w-full flex items-center justify-between gap-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <span className="truncate">{agent.short}</span>
          <ChevronDown className={`size-3.5 transition-transform ${howOpen ? "rotate-180" : ""}`} />
        </button>
        {howOpen && (
          <div className="mt-2 rounded-md border border-border bg-[var(--color-secondary)]/40 p-2.5 text-[11px] space-y-2 motion-safe:animate-in motion-safe:fade-in">
            <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Inputs</div>
              <div className="flex flex-wrap gap-1 mt-1">{agent.inputs.map(x => <span key={x} className="chip text-[10px]">{x}</span>)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Guardrails</div>
              <ul className="mt-1 list-disc list-inside text-muted-foreground">
                {agent.guardrails.map(g => <li key={g}>{g}</li>)}
              </ul>
            </div>
            <p className="text-[10px] text-muted-foreground">Simulated latency 400–900ms.</p>
          </div>
        )}
        {expertLocked && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-warning)]">
            <Lock className="size-3" /> Expert role required to commit changes.
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3 shrink-0" /> Not medical advice
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} key={agent.id} className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
        {messages.length === 0 && !thinking && (
          <div className="my-auto max-w-full text-center px-1 py-6">
            <div className="size-10 mx-auto rounded-lg bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center">
              <Sparkles className="size-4 text-[var(--color-primary)]" />
            </div>
            <h3 className="mt-2 text-sm font-semibold">{agent.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">{agent.short}</p>
            {agent.id === "ask-atlas" && (
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {PROMPT_CHIPS.slice(0, 4).map((p) => (
                  <button key={p} type="button" onClick={() => void send(p)} className="chip hover:chip-accent text-[11px]">{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} msg={m} />
          ) : (
            <AssistantBubble key={m.id} msg={m} assistantLabel={agent.name} />
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            {agent.name} is reasoning…
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        className="shrink-0 border-t border-border p-3 flex flex-col gap-2"
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attachments.map((a, i) => (
              <span key={i} className="chip chip-accent text-[10px]">
                {a}
                <button type="button" aria-label="Remove" onClick={() => setAttachments(arr => arr.filter((_, j) => j !== i))} className="ml-1 hover:text-[var(--color-destructive)]">×</button>
              </span>
            ))}
          </div>
        )}
        {showUrl && (
          <div className="flex gap-1">
            <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)} placeholder="https://…" className="flex-1 h-9 px-2 rounded-md bg-[var(--color-input)] border border-border text-xs outline-none focus:border-primary" />
            <button type="button" onClick={addUrl} className="h-9 px-3 rounded-md border border-border text-xs">Add</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" hidden onChange={onFile} />
          <button type="button" title="Attach file" aria-label="Attach file" onClick={() => fileRef.current?.click()} className="size-9 grid place-items-center rounded-md border border-border hover:border-primary/40 text-muted-foreground"><Paperclip className="size-3.5" /></button>
          <button type="button" title="Add URL" aria-label="Add URL" onClick={() => setShowUrl(s => !s)} className="size-9 grid place-items-center rounded-md border border-border hover:border-primary/40 text-muted-foreground text-xs">URL</button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.name}…`}
            className="flex-1 min-w-0 h-9 px-2.5 rounded-md bg-[var(--color-input)] border border-border outline-none focus:border-primary text-sm"
          />
          <button type="submit" className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-1 shrink-0" aria-label="Send message">
            <Send className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function UserBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className="self-end max-w-[90%] flex flex-col items-end gap-1">
      <div className="rounded-lg rounded-br-sm bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 px-3 py-2 text-sm">{msg.content}</div>
      {msg.references && msg.references.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-end">
          {msg.references.map(r => <span key={r} className="chip text-[10px]">{r}</span>)}
        </div>
      )}
    </div>
  );
}

function DeviceReviewStream({ review }: { review: DeviceReviewSnapshot }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(1);
    const t2 = window.setTimeout(() => setStep(2), 420);
    const t3 = window.setTimeout(() => setStep(3), 840);
    const t4 = window.setTimeout(() => setStep(4), 1280);
    return () => { window.clearTimeout(t2); window.clearTimeout(t3); window.clearTimeout(t4); };
  }, [review.deviceId]);

  return (
    <div className="mt-2 flex flex-col gap-2.5">
      {step >= 1 && (
        <div className="glass-panel rounded-lg p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold flex items-center gap-1.5 min-w-0"><Sparkles className="size-3.5 shrink-0 text-[var(--color-primary)]" /> AI Summary</div>
            <ConfidenceBadge value={review.confidence} className="shrink-0" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{review.summary}</p>
        </div>
      )}
      {step >= 2 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Strengths</div>
          <ul className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
            {review.strengths.map((s) => (<li key={s} className="flex gap-2"><span className="text-[var(--color-success)] shrink-0">+</span>{s}</li>))}
          </ul>
        </div>
      )}
      {step >= 3 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Tradeoffs</div>
          <ul className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
            {review.tradeoffs.map((s) => (<li key={s} className="flex gap-2"><span className="text-[var(--color-warning)] shrink-0">!</span>{s}</li>))}
          </ul>
        </div>
      )}
      {step >= 4 && (
        <div className="panel-elevated p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <div className="text-xs font-semibold mb-2">Provenance</div>
          <div className="flex flex-wrap gap-1">{review.sources.map((s) => (<span key={s} className="chip">{s}</span>))}</div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">AI-generated guidance, not medical advice.</p>
        </div>
      )}
    </div>
  );
}

function AssistantBubble({ msg, assistantLabel = "Assistant" }: { msg: AIMessage; assistantLabel?: string }) {
  return (
    <div className="self-start max-w-[95%] flex gap-2">
      <div className="size-7 rounded-md bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-info)]/20 grid place-items-center shrink-0">
        <Sparkles className="size-3.5 text-[var(--color-primary)]" />
      </div>
      <div className="flex-1 min-w-0 glass-panel rounded-lg rounded-tl-sm p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{assistantLabel}</div>
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
              {msg.rationale.map((r, i) => (<li key={i} className="flex gap-1.5"><span className="text-[var(--color-primary)]">·</span>{r}</li>))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
