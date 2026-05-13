import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Layers, Network, Stethoscope, Users, Wrench, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { JourneyDisclaimer } from "@/components/journey/JourneyDisclaimer";
import { ScenarioBreakdown } from "@/components/journey/ScenarioBreakdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDevice } from "@/lib/atlas/data";
import { journeyContentFor } from "@/lib/journey/journey-content";
import type { SampleFigure } from "@/lib/journey/journey-content";

export const Route = createFileRoute("/journey/$deviceId")({
  component: JourneyOverview,
});

function FigureCard({ f }: { f: SampleFigure }) {
  const external = f.src.startsWith("http");
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-[var(--color-surface)]/50">
      <img
        src={f.src}
        alt={f.alt}
        loading="lazy"
        className="max-h-64 w-full object-contain bg-black/20"
        referrerPolicy={external ? "no-referrer" : undefined}
      />
      <figcaption className="border-t border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
        <span className="text-foreground/90">{f.caption}</span>
        <span className="mt-1 block opacity-80">{f.credit}</span>
      </figcaption>
    </figure>
  );
}

function JourneyOverview() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const device = getDevice(deviceId);
  const content = useMemo(() => (device ? journeyContentFor(device.modality) : null), [device]);
  const [tab, setTab] = useState("overview");

  if (!device || !content) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Machine not found.</p>
        <Link to="/journey" className="text-sm text-[var(--color-primary)]">
          Back to machine list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/journey" })}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-3" /> All machines
        </button>
        <div className="chip chip-accent w-fit">
          <Layers className="size-3" /> {device.modality} · {device.vendor}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{device.name}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{device.tagline}</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap bg-[var(--color-surface)]/60 border border-border p-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <Users className="size-3.5" /> Actors & overview
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-1.5">
            <Wrench className="size-3.5" /> Setup flow
          </TabsTrigger>
          <TabsTrigger value="use" className="gap-1.5">
            <Workflow className="size-3.5" /> User flow
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-1.5">
            <Network className="size-3.5" /> Images & data
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-1.5">
            <Stethoscope className="size-3.5" /> Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="glass-panel p-4">
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">What this modality involves</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{content.modalityIntro}</p>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Actors & roles</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.actors.map((a) => (
                <div key={a.role} className="rounded-lg border border-border bg-[var(--color-surface)]/60 p-4">
                  <div className="text-sm font-semibold">{a.role}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{a.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            High-level installation and readiness arc. OEM site manuals, local regulation, and physicist sign-off always win over any generic outline.
          </p>
          {content.setupFlow.map((phase) => (
            <section key={phase.title} className="rounded-lg border border-border bg-[var(--color-surface)]/40 p-4">
              <h3 className="text-base font-semibold">{phase.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{phase.summary}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/90 marker:text-[var(--color-primary)]">
                {phase.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <h3 className="text-sm font-semibold text-amber-200/90">{content.modality} — setup highlights</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground/85 marker:text-amber-400/80">
              {content.setupNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="use" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Typical clinical path from order to report. Your hospital’s policies, protocols, and OEM IFU are authoritative.
          </p>
          {content.userFlow.map((phase) => (
            <section key={phase.title} className="rounded-lg border border-border bg-[var(--color-surface)]/40 p-4">
              <h3 className="text-base font-semibold">{phase.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{phase.summary}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/90 marker:text-[var(--color-primary)]">
                {phase.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
            <h3 className="text-sm font-semibold text-sky-200/90">{content.modality} — clinical-use highlights</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground/85 marker:text-sky-400/80">
              {content.useNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Illustrative images and diagrams — educational context for what studies and data objects look like. External photos are credited; all patient-like IDs in examples are synthetic.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.sampleFigures.map((f) => (
              <FigureCard key={f.src + f.caption} f={f} />
            ))}
          </div>

          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold">Example DICOM metadata (synthetic)</h3>
            <p className="mt-1 text-xs text-muted-foreground">Tags travel with the image; viewers and PACS index them for routing and display.</p>
            <div className="mt-3 overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-[var(--color-secondary)]/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tag</th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {content.dicomTagExamples.map((row) => (
                    <tr key={row.tag} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-[var(--color-primary)]">{row.tag}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2 font-mono text-foreground/80">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Integration snapshot</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {content.integrationSnapshot.map((item) => (
                <div key={item.title} className="rounded-md border border-border bg-[var(--color-surface)]/60 p-3">
                  <div className="text-xs font-semibold text-[var(--color-primary)]">{item.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Further reading</h3>
            <div className="flex flex-col gap-2">
              {content.resources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-[var(--color-surface)]/60 px-3 py-2 text-sm transition hover:border-primary/40"
                >
                  <span>
                    <span className="font-medium">{r.label}</span>
                    <span className="ml-2 text-[11px] text-muted-foreground">{r.org}</span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioBreakdown modality={device.modality} />
        </TabsContent>
      </Tabs>

      <JourneyDisclaimer />
    </div>
  );
}
