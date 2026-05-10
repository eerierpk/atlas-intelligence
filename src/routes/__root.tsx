import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AiPanelProvider } from "@/lib/atlas/ai-panel-context";
import { AtlasProvider } from "@/lib/atlas/store";
import { ThemeProvider } from "@/lib/atlas/theme";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-panel rounded-xl p-8">
        <div className="text-7xl font-bold text-mono text-[var(--color-primary)]">404</div>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The route you're looking for isn't part of the Atlas workspace.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-medium hover:opacity-90">
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-panel rounded-xl p-8">
        <h1 className="text-lg font-semibold tracking-tight">A panel failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MedIntel Atlas — AI-Powered Healthcare Infrastructure Intelligence" },
      { name: "description", content: "Decision-intelligence workspace for medical equipment and clinical infrastructure across the global medical technology industry. AI-assisted exploration, comparison and procurement recommendations." },
      { name: "author", content: "MedIntel" },
      { property: "og:title", content: "MedIntel Atlas — AI-Powered Healthcare Infrastructure Intelligence" },
      { property: "og:description", content: "Decision-intelligence workspace for medical equipment and clinical infrastructure across the global medical technology industry. AI-assisted exploration, comparison and procurement recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "MedIntel Atlas — AI-Powered Healthcare Infrastructure Intelligence" },
      { name: "twitter:description", content: "Decision-intelligence workspace for medical equipment and clinical infrastructure across the global medical technology industry. AI-assisted exploration, comparison and procurement recommendations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/697927a1-97b0-4dab-8f42-6f4fc96dac83/id-preview-e9496d61--d314f8c5-e30b-446b-957b-65e4f85297ce.lovable.app-1778254041059.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/697927a1-97b0-4dab-8f42-6f4fc96dac83/id-preview-e9496d61--d314f8c5-e30b-446b-957b-65e4f85297ce.lovable.app-1778254041059.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AtlasProvider>
          <AiPanelProvider>
            <Outlet />
            <Toaster />
          </AiPanelProvider>
        </AtlasProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
