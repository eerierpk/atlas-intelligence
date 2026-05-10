import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Boxes, ExternalLink, GraduationCap, Layers, RefreshCcw, Wrench, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { JourneyDisclaimer } from "@/components/journey/JourneyDisclaimer";
import { CheckpointQuiz, LessonAccordion } from "@/components/journey/LessonAccordion";
import { ElementsMap, GlossaryView } from "@/components/journey/ElementsMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDevice } from "@/lib/atlas/data";
import { curriculumFor, totalLessons } from "@/lib/journey/curriculum";
import { pctComplete, useJourneyProgress } from "@/lib/journey/progress";

export const Route = createFileRoute("/journey/$deviceId")({
  component: JourneyCourse,
});

function JourneyCourse() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const device = getDevice(deviceId);
  const curriculum = useMemo(() => (device ? curriculumFor(device.modality) : null), [device]);
  const { progress, markComplete, recordQuiz, toggleBookmark, reset } = useJourneyProgress(deviceId);
  const [section, setSection] = useState("overview");

  if (!device || !curriculum) {
    return (
      <AppShell>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Machine not found.</p>
          <Link to="/journey" className="text-sm text-[var(--color-primary)]">Back to picker</Link>
        </div>
      </AppShell>
    );
  }

  const total = totalLessons(curriculum);
  const completed = new Set(progress.completedLessons);
  const bookmarks = new Set(progress.bookmarks);
  const pct = pctComplete(progress, total);

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-3">
          <button onClick={() => navigate({ to: "/journey" })} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> All machines
          </button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="chip chip-accent mb-2"><GraduationCap className="size-3" /> {device.modality} · {device.vendor}</div>
              <h1 className="text-2xl font-semibold tracking-tight">{device.name}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl mt-1">{device.tagline}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</div>
              <div className="text-2xl font-semibold tabular-nums">{pct}<span className="text-sm text-muted-foreground">%</span></div>
              <div className="text-[11px] text-muted-foreground">{progress.completedLessons.length} / {total} lessons</div>
              <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1">
                <RefreshCcw className="size-3" /> Reset
              </button>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-secondary)]/60 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </header>

        <Tabs value={section} onValueChange={setSection} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-[var(--color-surface)]/60 border border-border p-1">
            <TabsTrigger value="overview" className="gap-1.5"><BookOpen className="size-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="setup" className="gap-1.5"><Wrench className="size-3.5" /> Setup flow</TabsTrigger>
            <TabsTrigger value="use" className="gap-1.5"><Workflow className="size-3.5" /> Use flow</TabsTrigger>
            <TabsTrigger value="elements" className="gap-1.5"><Layers className="size-3.5" /> Elements map</TabsTrigger>
            <TabsTrigger value="glossary" className="gap-1.5"><Boxes className="size-3.5" /> Glossary</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5"><ExternalLink className="size-3.5" /> Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="glass-panel p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">What this modality does</div>
              <p className="text-sm leading-relaxed">{curriculum.overview}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-4">
                <Wrench className="size-4 text-[var(--color-primary)]" />
                <div className="mt-2 text-sm font-semibold">Setup flow</div>
                <p className="text-xs text-muted-foreground mt-1">{curriculum.setup.length} chapters · {curriculum.setup.reduce((n, c) => n + c.lessons.length, 0)} lessons</p>
              </div>
              <div className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-4">
                <Workflow className="size-4 text-[var(--color-primary)]" />
                <div className="mt-2 text-sm font-semibold">Use flow</div>
                <p className="text-xs text-muted-foreground mt-1">{curriculum.use.length} chapters · {curriculum.use.reduce((n, c) => n + c.lessons.length, 0)} lessons</p>
              </div>
              <div className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-4">
                <Layers className="size-4 text-[var(--color-primary)]" />
                <div className="mt-2 text-sm font-semibold">Elements</div>
                <p className="text-xs text-muted-foreground mt-1">{curriculum.elements.length} hardware / software / ecosystem tiles</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            {curriculum.setup.map((ch) => (
              <section key={ch.id} className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold">{ch.title}</h2>
                  <p className="text-xs text-muted-foreground">{ch.summary}</p>
                </div>
                <LessonAccordion
                  chapter={ch}
                  completed={completed}
                  bookmarks={bookmarks}
                  onComplete={markComplete}
                  onToggleBookmark={toggleBookmark}
                />
                <CheckpointQuiz chapter={ch} initialScore={progress.quizScores[ch.id]} onScore={(p) => recordQuiz(ch.id, p)} />
              </section>
            ))}
          </TabsContent>

          <TabsContent value="use" className="space-y-6">
            {curriculum.use.map((ch) => (
              <section key={ch.id} className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold">{ch.title}</h2>
                  <p className="text-xs text-muted-foreground">{ch.summary}</p>
                </div>
                <LessonAccordion
                  chapter={ch}
                  completed={completed}
                  bookmarks={bookmarks}
                  onComplete={markComplete}
                  onToggleBookmark={toggleBookmark}
                />
                <CheckpointQuiz chapter={ch} initialScore={progress.quizScores[ch.id]} onScore={(p) => recordQuiz(ch.id, p)} />
              </section>
            ))}
          </TabsContent>

          <TabsContent value="elements">
            <ElementsMap elements={curriculum.elements} />
          </TabsContent>

          <TabsContent value="glossary">
            <GlossaryView terms={curriculum.glossary} />
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid gap-2 sm:grid-cols-2">
              {curriculum.resources.map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer noopener"
                  className="rounded-md border border-border bg-[var(--color-surface)]/60 p-3 hover:border-primary/40 transition flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-[11px] text-muted-foreground">{r.org}</div>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <JourneyDisclaimer />
      </div>
    </AppShell>
  );
}
