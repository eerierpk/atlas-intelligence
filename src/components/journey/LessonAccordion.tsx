import { Bookmark, BookmarkCheck, Check, ChevronDown, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Chapter, Lesson, LessonBlock } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

function Block({ b }: { b: LessonBlock }) {
  switch (b.kind) {
    case "p":
      return <p className="text-sm leading-relaxed text-foreground/90">{b.text}</p>;
    case "list":
      return (
        <ul className="text-sm space-y-1.5 list-disc pl-5 text-foreground/90 marker:text-[var(--color-primary)]">
          {b.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "callout": {
      const Icon = b.tone === "warn" ? AlertTriangle : b.tone === "ok" ? CheckCircle2 : Info;
      const color = b.tone === "warn" ? "amber" : b.tone === "ok" ? "emerald" : "sky";
      return (
        <div className={cn(
          "rounded-md border p-3 text-sm flex items-start gap-2",
          color === "amber" && "border-amber-500/40 bg-amber-500/5 text-amber-200",
          color === "emerald" && "border-emerald-500/40 bg-emerald-500/5 text-emerald-200",
          color === "sky" && "border-sky-500/40 bg-sky-500/5 text-sky-200",
        )}>
          <Icon className="size-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{b.text}</span>
        </div>
      );
    }
    case "image":
      return (
        <figure className="rounded-lg border border-border overflow-hidden bg-[var(--color-surface)]">
          <img src={b.src} alt={b.alt} loading="lazy" className="w-full h-auto block" />
          {(b.caption || b.credit) && (
            <figcaption className="text-[11px] text-muted-foreground p-2 border-t border-border">
              {b.caption} {b.credit && <span className="opacity-70"> · {b.credit}</span>}
            </figcaption>
          )}
        </figure>
      );
    case "tagTable":
      return (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--color-secondary)]/40 text-muted-foreground">
              <tr><th className="text-left px-3 py-1.5 font-medium">Tag</th><th className="text-left px-3 py-1.5 font-medium">Name</th><th className="text-left px-3 py-1.5 font-medium">Example value</th></tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono text-[var(--color-primary)]">{r.tag}</td>
                  <td className="px-3 py-1.5">{r.name}</td>
                  <td className="px-3 py-1.5 font-mono text-foreground/80">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "deepDive":
      return (
        <details className="rounded-md border border-border bg-[var(--color-surface)]/60 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1">
            <ChevronDown className="size-3" /> Deep dive: {b.title}
          </summary>
          <p className="text-sm text-foreground/85 mt-2 leading-relaxed">{b.text}</p>
        </details>
      );
  }
}

export function LessonAccordion({
  chapter,
  completed,
  bookmarks,
  onComplete,
  onToggleBookmark,
}: {
  chapter: Chapter;
  completed: Set<string>;
  bookmarks: Set<string>;
  onComplete: (lessonId: string) => void;
  onToggleBookmark: (lessonId: string) => void;
}) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {chapter.lessons.map((l: Lesson) => {
        const done = completed.has(l.id);
        const bm = bookmarks.has(l.id);
        return (
          <AccordionItem key={l.id} value={l.id} className="border border-border rounded-md bg-[var(--color-surface)]/40 px-3">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <span className={cn("size-5 rounded-full grid place-items-center border text-[10px] shrink-0",
                  done ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300" : "border-border text-muted-foreground")}>
                  {done ? <Check className="size-3" /> : ""}
                </span>
                <span className="text-sm font-medium truncate text-left">{l.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{l.minutes} min</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              {l.body.map((b, i) => <Block key={i} b={b} />)}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => onComplete(l.id)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs border transition inline-flex items-center gap-1.5",
                    done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-primary/40 bg-[var(--color-accent)]/40 text-foreground hover:bg-[var(--color-accent)]/70",
                  )}
                >
                  <Check className="size-3.5" /> {done ? "Completed" : "Mark complete"}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(l.id)}
                  className="h-8 px-3 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                >
                  {bm ? <BookmarkCheck className="size-3.5 text-[var(--color-primary)]" /> : <Bookmark className="size-3.5" />}
                  {bm ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function CheckpointQuiz({
  chapter,
  initialScore,
  onScore,
}: {
  chapter: Chapter;
  initialScore?: number;
  onScore: (pct: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = (qi: number, oi: number, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qi] ?? [];
      if (multi) {
        return { ...prev, [qi]: cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi] };
      }
      return { ...prev, [qi]: [oi] };
    });
  };

  const submit = () => {
    let correct = 0;
    chapter.checkpoint.forEach((q, qi) => {
      const a = (answers[qi] ?? []).slice().sort();
      const c = q.correct.slice().sort();
      if (a.length === c.length && a.every((v, i) => v === c[i])) correct++;
    });
    const pct = Math.round((correct / chapter.checkpoint.length) * 100);
    setSubmitted(true);
    onScore(pct);
  };

  if (chapter.checkpoint.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-[var(--color-accent)]/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Checkpoint — {chapter.title}</div>
        {initialScore !== undefined && !submitted && (
          <span className="text-[11px] text-muted-foreground">Best: {initialScore}%</span>
        )}
      </div>
      {chapter.checkpoint.map((q, qi) => {
        const sel = answers[qi] ?? [];
        const isCorrect = submitted && sel.slice().sort().join() === q.correct.slice().sort().join();
        return (
          <div key={qi} className="space-y-2">
            <div className="text-sm font-medium">{qi + 1}. {q.q} {q.type === "multi" && <span className="text-[10px] text-muted-foreground">(select all)</span>}</div>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const checked = sel.includes(oi);
                const isAnswer = q.correct.includes(oi);
                return (
                  <label key={oi} className={cn(
                    "flex items-center gap-2 text-sm rounded-md border px-2.5 py-1.5 cursor-pointer transition",
                    checked ? "border-primary/50 bg-[var(--color-accent)]/60" : "border-border",
                    submitted && isAnswer && "border-emerald-500/60 bg-emerald-500/10",
                    submitted && checked && !isAnswer && "border-rose-500/60 bg-rose-500/10",
                  )}>
                    <input
                      type={q.type === "multi" ? "checkbox" : "radio"}
                      name={`q-${chapter.id}-${qi}`}
                      checked={checked}
                      onChange={() => toggle(qi, oi, q.type === "multi")}
                      disabled={submitted}
                      className="accent-[var(--color-primary)]"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
            {submitted && (
              <div className={cn("text-xs rounded-md p-2", isCorrect ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200")}>
                {isCorrect ? "Correct. " : "Not quite. "} {q.rationale}
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={Object.keys(answers).length < chapter.checkpoint.length}
            className="h-9 px-4 rounded-md text-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] text-[var(--color-primary-foreground)] disabled:opacity-50"
          >
            Submit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="h-9 px-4 rounded-md text-sm border border-border"
          >
            Retake
          </button>
        )}
      </div>
    </div>
  );
}
