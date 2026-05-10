import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/atlas/AppShell";

export const Route = createFileRoute("/journey")({
  component: JourneyLayout,
  head: () => ({
    meta: [
      { title: "Machine Journey — MedIntel Atlas" },
      { name: "description", content: "Overview of actors, setup flow, clinical use, and sample imaging data for each modality." },
    ],
  }),
});

function JourneyLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
