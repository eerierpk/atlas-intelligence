import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Activity, BarChart3, Bookmark, Compass, GitCompare, LayoutDashboard, LogOut, Search, Sparkles, ShieldCheck, Command as CmdIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAtlas } from "@/lib/atlas/store";
import { CommandPalette } from "./CommandPalette";

const NAV = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/explore", label: "Explore Devices", icon: Compass },
  { to: "/compare", label: "Comparison Workspace", icon: GitCompare },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/insights", label: "Market Insights", icon: BarChart3 },
  { to: "/saved", label: "Saved Workspace", icon: Bookmark },
] as const;

export function AppShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { user, logout, comparisonIds } = useAtlas();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-[var(--color-surface)]/70 backdrop-blur sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] grid place-items-center accent-glow">
            <Activity className="size-4 text-[var(--color-primary-foreground)]" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">MedIntel Atlas</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 tracking-wider uppercase">Imaging Intelligence</div>
          </div>
        </Link>

        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-4 flex-1 max-w-xl flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--color-input)]/60 border border-border hover:border-primary/40 transition text-sm text-muted-foreground"
        >
          <Search className="size-4" />
          <span>Search devices, vendors, scenarios…</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-secondary)] border border-border">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-secondary)] border border-border">K</kbd>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 chip">
            <ShieldCheck className="size-3" />
            <span>Planning intel — not diagnostic</span>
          </div>
          {comparisonIds.length > 0 && (
            <Link to="/compare" className="chip chip-accent">
              <GitCompare className="size-3" /> {comparisonIds.length} in compare
            </Link>
          )}
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-xs font-medium">{user.name}</div>
            <div className="text-[10px] text-muted-foreground">{user.role}</div>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="size-9 rounded-md grid place-items-center border border-border hover:border-destructive/40 hover:text-destructive transition"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-border bg-[var(--color-surface)]/40 hidden md:flex flex-col">
          <nav className="p-3 flex flex-col gap-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-2">Workspace</div>
            {NAV.map(item => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition border border-transparent ${
                    active ? "bg-[var(--color-accent)]/40 text-foreground border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-[var(--color-secondary)]/50"
                  }`}
                >
                  <item.icon className={`size-4 ${active ? "text-[var(--color-primary)]" : ""}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-3">
            <div className="glass-panel rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CmdIcon className="size-3.5 text-[var(--color-primary)]" /> Decision Trail
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Every recommendation in Atlas exposes its scoring rationale, weighted factors, and source provenance.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 p-6 lg:p-8">{children}</div>
          {right && (
            <aside className="w-80 shrink-0 border-l border-border bg-[var(--color-surface)]/40 hidden xl:block">
              <div className="sticky top-14 p-4">{right}</div>
            </aside>
          )}
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
