import { Command } from "cmdk";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Boxes, GitCompare, Bookmark, BarChart3, LayoutDashboard, Search, Bot } from "lucide-react";
import { AGENTS } from "@/lib/atlas/agents";
import { DEVICES } from "@/lib/atlas/data";
import { useEffect } from "react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start pt-[12vh]" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <Command className="glass-panel rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-border">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search devices, navigate, ask AI…"
              className="flex-1 h-12 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] text-mono px-1.5 py-0.5 rounded bg-[var(--color-secondary)] border border-border">ESC</kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-muted-foreground text-center">No matches.</Command.Empty>

            <Command.Group heading="Navigate" className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">
              {[
                { to: "/dashboard", label: "Command Centre", icon: LayoutDashboard },
                { to: "/explore", label: "Devices", icon: Boxes },
                { to: "/compare", label: "Comparison", icon: GitCompare },
                { to: "/assistant", label: "AI Assistant", icon: Sparkles },
                { to: "/insights", label: "Market Insights", icon: BarChart3 },
                { to: "/agents", label: "Agents", icon: Bot },
                { to: "/saved", label: "Workspace", icon: Bookmark },
              ].map(n => (
                <Command.Item key={n.to} value={n.label} onSelect={() => go(n.to)} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-accent)]/40">
                  <n.icon className="size-4 text-[var(--color-primary)]" /> {n.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Devices" className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
              {DEVICES.map(d => (
                <Command.Item
                  key={d.id}
                  value={`${d.name} ${d.vendor} ${d.modality}`}
                  onSelect={() => { onOpenChange(false); navigate({ to: "/devices/$deviceId", params: { deviceId: d.id } }); }}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-accent)]/40"
                >
                  <span className="chip">{d.modality}</span>
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{d.vendor}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Agents" className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
              {AGENTS.map(a => (
                <Command.Item
                  key={a.id}
                  value={`agent ${a.name} ${a.description}`}
                  onSelect={() => { onOpenChange(false); navigate({ to: "/agents" }); }}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-accent)]/40"
                >
                  <Bot className="size-4 text-[var(--color-primary)]" />
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto truncate max-w-[200px]">{a.description}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Ask AI" className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-2">
              {[
                "Best MRI for neuro + oncology",
                "High throughput CT for ER",
                "Cost-efficient 1.5T MRI",
              ].map(q => (
                <Command.Item key={q} value={q} onSelect={() => go("/assistant")} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-[var(--color-accent)]/40">
                  <Sparkles className="size-4 text-[var(--color-primary)]" /> {q}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border flex items-center justify-between">
            <span>MedIntel Atlas · Command Palette</span>
            <Link to="/assistant" onClick={() => onOpenChange(false)} className="hover:text-foreground">Open AI Assistant →</Link>
          </div>
        </Command>
      </div>
    </div>
  );
}
