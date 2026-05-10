import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { useAiPanelUi } from "@/lib/atlas/ai-panel-context";

export const Route = createFileRoute("/assistant")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  component: AssistantRedirect,
});

/** Legacy route: opens the global Ask AI panel and returns to Command Centre. */
function AssistantRedirect() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { queueAndOpen } = useAiPanelUi();

  useLayoutEffect(() => {
    queueAndOpen(q);
    navigate({ to: "/dashboard", replace: true });
  }, [q, queueAndOpen, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground p-8">
      Opening Ask Atlas…
    </div>
  );
}
