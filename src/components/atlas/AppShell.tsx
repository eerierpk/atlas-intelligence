import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity, BarChart3, Bookmark, Boxes, Bot, Calculator, GitCompare, GraduationCap, LayoutDashboard,
  LogOut, Menu, Moon, Search, ShieldCheck, Sparkles, Sun, X, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAiPanelUi } from "@/lib/atlas/ai-panel-context";
import { can } from "@/lib/atlas/permissions";
import { useAtlas } from "@/lib/atlas/store";
import { useTheme } from "@/lib/atlas/theme";
import { AtlasChatPanel } from "./AtlasChatPanel";
import { CommandPalette } from "./CommandPalette";

const BASE_NAV = [
  { to: "/dashboard", label: "Command Centre", icon: LayoutDashboard },
  { to: "/explore", label: "Devices", icon: Boxes },
  { to: "/compare", label: "Comparison", icon: GitCompare },
  { to: "/insights", label: "Market Insights", icon: BarChart3 },
  { to: "/roi", label: "ROI calculator", icon: Calculator },
  { to: "/journey", label: "Machine Journey", icon: GraduationCap },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/saved", label: "Workspace", icon: Bookmark },
] as const;

const ADMIN_ITEM = { to: "/admin", label: "Administration", icon: ShieldCheck } as const;

export const NAV = BASE_NAV;

export function AppShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { user, logout, comparisonIds } = useAtlas();
  const { theme, toggle } = useTheme();
  const { isOpen: aiPanelOpen, toggle: toggleAiPanel, open: openAiPanel } = useAiPanelUi();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useMemo(
    () => (can(user?.userRole, "manage:users") ? [...BASE_NAV, ADMIN_ITEM] : [...BASE_NAV]),
    [user?.userRole],
  );

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  useEffect(() => { setMobileOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const inField =
        tgt &&
        (tgt.tagName === "INPUT" ||
          tgt.tagName === "TEXTAREA" ||
          tgt.tagName === "SELECT" ||
          tgt.isContentEditable);

      if (e.key === "/" && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.shiftKey && e.key.toLowerCase() === "a" && !inField) {
        e.preventDefault();
        openAiPanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAiPanel]);

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
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search across MedIntel Atlas. Press slash to open."
          className="ml-2 sm:ml-4 flex h-9 min-w-0 max-w-xl flex-1 items-center gap-2 rounded-md border border-border bg-[var(--color-input)] px-3 text-left text-sm text-muted-foreground transition hover:border-primary/40"
          title="Press / to open search from anywhere. Shift+A opens Ask AI."
        >
          <Search className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Search devices, agents, scenarios…</span>
          <kbd className="pointer-events-none ml-auto hidden shrink-0 select-none rounded border border-border bg-[var(--color-secondary)]/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/90 md:inline" aria-hidden>
            /
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {comparisonIds.length > 0 && (
            <Link to="/compare" className="chip chip-accent hidden sm:inline-flex">
              <GitCompare className="size-3" /> {comparisonIds.length}
            </Link>
          )}

          <button
            type="button"
            onClick={toggleAiPanel}
            className={`flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm transition sm:px-3 ${aiPanelOpen ? "border-primary/50 bg-[var(--color-accent)]/40 text-[var(--color-primary)]" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
            title="Ask AI — keyboard: Shift+A"
          >
            <Sparkles className="size-4 shrink-0" />
            <span className="hidden sm:inline">Ask AI</span>
            <kbd className="pointer-events-none hidden select-none rounded border border-border bg-[var(--color-secondary)]/70 px-1 py-px font-mono text-[9px] text-muted-foreground sm:inline" aria-hidden>
              ⇧A
            </kbd>
          </button>

          <button onClick={toggle} className="size-9 rounded-md grid place-items-center border border-border hover:border-primary/40 transition" title="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="text-right leading-tight hidden lg:block ml-1">
            <div className="text-xs font-medium flex items-center justify-end gap-1.5">{user.name}
              <span className="chip chip-accent !py-0 !px-1.5 text-[9px] uppercase tracking-wider">{user.userRole}</span>
            </div>
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

      <div className="flex min-h-0 flex-1 items-start">
        {/* Desktop sidebar — sticky under header, viewport-tall; nav scrolls inside */}
        <aside
          className={`${sidebarWidth} sticky top-14 hidden h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] min-h-0 shrink-0 border-r border-border bg-[var(--color-surface)]/40 transition-[width] duration-200 md:flex md:flex-col self-start`}
        >
          <div className="z-10 shrink-0 border-b border-border bg-[var(--color-surface)]/95 p-2 backdrop-blur">
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

          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {NAV.map(item => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  {...(item.to === "/explore" ? { search: { q: "" } } : item.to === "/roi" ? { search: { device: "" } } : {})}
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
          {!collapsed && (
            <div className="flex shrink-0 flex-col gap-2 border-t border-border p-2 pt-3">
              <div className="glass-panel p-3">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="size-3.5 text-[var(--color-primary)]" /> Decision Trail
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Every recommendation exposes its scoring rationale, weighted factors, and source provenance.
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Main — items-start so the AI aside keeps viewport height; sticky can track page scroll */}
        <main className="flex min-h-0 min-w-0 flex-1 items-start">
          <div className="min-h-0 min-w-0 flex-1 p-4 pb-20 sm:p-6 md:pb-8 lg:p-8">{children}</div>
          {right && (
            <aside className="w-80 shrink-0 border-l border-border bg-[var(--color-surface)]/40 hidden xl:block">
              <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">{right}</div>
            </aside>
          )}
          {aiPanelOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[2px] md:hidden"
                onClick={toggleAiPanel}
                aria-label="Close AI panel"
              />
              <aside
                className="flex min-h-0 max-w-md flex-col border-l border-border bg-[var(--color-surface)] shadow-2xl max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:right-0 max-md:top-14 max-md:z-50 max-md:w-full md:sticky md:top-14 md:z-auto md:h-[calc(100vh-3.5rem)] md:max-h-[calc(100vh-3.5rem)] md:w-[380px] md:max-w-none md:shrink-0 md:self-start md:shadow-none"
              >
                <AtlasChatPanel />
              </aside>
            </>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur border-t border-border flex items-center justify-around h-14 px-1">
        {NAV.slice(0, 5).map(item => {
          const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
          return (
            <Link key={item.to} to={item.to} {...(item.to === "/explore" ? { search: { q: "" } } : item.to === "/roi" ? { search: { device: "" } } : {})} className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] ${active ? "text-[var(--color-primary)]" : "text-muted-foreground"}`}>
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
                <Link key={item.to} to={item.to} {...(item.to === "/explore" ? { search: { q: "" } } : item.to === "/roi" ? { search: { device: "" } } : {})} className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm ${active ? "bg-[var(--color-accent)]/60 text-foreground" : "text-muted-foreground"}`}>
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
