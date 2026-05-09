import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity, BarChart3, Bookmark, Boxes, Bot, GitCompare, LayoutDashboard,
  LogOut, Menu, Moon, Search, Sparkles, Sun, X, ChevronsLeft, ChevronsRight, Share2,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAtlas } from "@/lib/atlas/store";
import { useTheme } from "@/lib/atlas/theme";
import { CommandPalette } from "./CommandPalette";
import { copyShareLink, openMailto } from "@/lib/atlas/share";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NAV = [
  { to: "/dashboard", label: "Command Centre", icon: LayoutDashboard },
  { to: "/explore", label: "Devices", icon: Boxes },
  { to: "/compare", label: "Comparison", icon: GitCompare },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/insights", label: "Market Insights", icon: BarChart3 },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/saved", label: "Workspace", icon: Bookmark },
] as const;

export function AppShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { user, logout, comparisonIds } = useAtlas();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  useEffect(() => { setMobileOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shareState = useMemo(() => ({
    title: "Atlas workspace snapshot",
    summary: `Workspace: ${comparisonIds.length} device(s) staged for comparison.`,
    deviceIds: comparisonIds,
  }), [comparisonIds]);

  if (!user) return null;

  const sidebarWidth = collapsed ? "w-14" : "w-60";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center px-3 sm:px-4 gap-2 sm:gap-4 bg-[var(--color-surface)]/70 backdrop-blur sticky top-0 z-30">
        <button onClick={() => setMobileOpen(true)} className="md:hidden size-9 grid place-items-center rounded-md border border-border" aria-label="Open navigation">
          <Menu className="size-4" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] grid place-items-center accent-glow shrink-0">
            <Activity className="size-4 text-[var(--color-primary-foreground)]" />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-sm font-semibold tracking-tight">MedIntel Atlas</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5 tracking-wider uppercase">Healthcare Infrastructure Intelligence</div>
          </div>
        </Link>

        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-2 sm:ml-4 flex-1 max-w-xl flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--color-input)] border border-border hover:border-primary/40 transition text-sm text-muted-foreground"
        >
          <Search className="size-4" />
          <span className="truncate hidden xs:inline sm:inline">Search devices, agents, scenarios…</span>
          <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] text-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-secondary)] border border-border">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-secondary)] border border-border">K</kbd>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {comparisonIds.length > 0 && (
            <Link to="/compare" className="chip chip-accent hidden sm:inline-flex">
              <GitCompare className="size-3" /> {comparisonIds.length}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-9 rounded-md grid place-items-center border border-border hover:border-primary/40 transition" title="Share / Email / Report">
                <Share2 className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Share workspace</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => copyShareLink(shareState)}>
                <Share2 className="size-4 mr-2" /> Copy share link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openMailto(shareState)}>
                <Search className="size-4 mr-2" /> Email summary
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/saved" })}>
                <Bookmark className="size-4 mr-2" /> Open workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={toggle} className="size-9 rounded-md grid place-items-center border border-border hover:border-primary/40 transition" title="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="text-right leading-tight hidden lg:block ml-1">
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
        {/* Desktop sidebar */}
        <aside className={`${sidebarWidth} shrink-0 border-r border-border bg-[var(--color-surface)]/40 hidden md:flex flex-col transition-[width] duration-200`}>
          <div className="p-2 sticky top-14 z-10 bg-[var(--color-surface)]/95 backdrop-blur border-b border-border">
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
              {!collapsed && <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2">Workspace</div>}
              <button
                onClick={() => setCollapsed(c => !c)}
                className={`h-8 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 ${collapsed ? "w-8" : "px-2.5"}`}
                title={collapsed ? "Expand navigation" : "Collapse navigation"}
                aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
                aria-pressed={collapsed}
              >
                {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
              </button>
            </div>
          </div>

          <nav className="p-2 flex flex-col gap-0.5">
            {NAV.map(item => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition border border-transparent ${
                    active ? "bg-[var(--color-accent)]/60 text-foreground border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-[var(--color-secondary)]/50"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className={`size-4 shrink-0 ${active ? "text-[var(--color-primary)]" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-2 pt-3 flex flex-col gap-2 border-t border-border">
            {!collapsed && (
              <div className="glass-panel p-3">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="size-3.5 text-[var(--color-primary)]" /> Decision Trail
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Every recommendation exposes its scoring rationale, weighted factors, and source provenance.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">{children}</div>
          {right && (
            <aside className="w-80 shrink-0 border-l border-border bg-[var(--color-surface)]/40 hidden xl:block">
              <div className="sticky top-14 p-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">{right}</div>
            </aside>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur border-t border-border flex items-center justify-around h-14 px-1">
        {NAV.slice(0, 5).map(item => {
          const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
          return (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] ${active ? "text-[var(--color-primary)]" : "text-muted-foreground"}`}>
              <item.icon className="size-4" />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile drawer for full nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-surface)] border-r border-border p-4 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Navigate</div>
              <button onClick={() => setMobileOpen(false)} className="size-8 grid place-items-center rounded-md border border-border"><X className="size-4" /></button>
            </div>
            {NAV.map(item => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link key={item.to} to={item.to} className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm ${active ? "bg-[var(--color-accent)]/60 text-foreground" : "text-muted-foreground"}`}>
                  <item.icon className="size-4" /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
