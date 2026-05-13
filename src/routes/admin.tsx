import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Plus, Search, Mail, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { CredentialsModal } from "@/components/admin/CredentialsModal";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import { UserTable } from "@/components/admin/UserTable";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { useAdminStore, type AdminUser, type OutboxEntry } from "@/lib/atlas/admin-store";
import { can } from "@/lib/atlas/permissions";
import { useAtlas } from "@/lib/atlas/store";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ROLE_FILTER_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Healthcare Professional", label: "Healthcare Professional" },
  { value: "Healthcare Expert", label: "Healthcare Expert" },
  { value: "Business / Stakeholder", label: "Business / Stakeholder" },
  { value: "Admin", label: "Admin" },
];

function AdminPage() {
  const { user } = useAtlas();
  const navigate = useNavigate();
  const allowed = can(user?.userRole, "manage:users");

  useEffect(() => {
    if (user && !allowed) navigate({ to: "/dashboard" });
  }, [user, allowed, navigate]);

  const { users, outbox, create, update, setStatus, resetAccess } = useAdminStore();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [modalEntry, setModalEntry] = useState<OutboxEntry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter && u.userRole !== roleFilter) return false;
      if (!q) return true;
      return [u.name, u.email, u.title, u.department, ...u.specializations, u.yearsExperience != null ? String(u.yearsExperience) : ""].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [users, query, roleFilter]);

  if (!user || !allowed) return null;

  return (
    <AppShell>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6 text-[var(--color-primary)]" /> Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Provision users, manage roles, simulate credential delivery. <span className="chip ml-1 text-[10px]">Prototype</span></p>
        </div>
        <button onClick={() => setCreating(true)} className="h-10 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium flex items-center gap-2 min-h-11 sm:min-h-10">
          <Plus className="size-4" /> Create user
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px] min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="glass-panel p-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 h-11 rounded-md border border-border bg-[var(--color-input)] px-3">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, specialization…" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <div className="sm:w-64">
              <SearchableCombobox
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="All roles"
                searchPlaceholder="Filter role…"
                allowClear
              />
            </div>
          </div>

          <UserTable
            users={filtered}
            onEdit={(u) => setEditing(u)}
            onReset={(u) => {
              const entry = resetAccess(u.id);
              if (entry) setModalEntry(entry);
            }}
            onToggleStatus={(u) => setStatus(u.id, u.status === "active" ? "disabled" : "active")}
          />

          <div className="glass-panel p-3 flex items-start gap-2 text-[11px] text-muted-foreground">
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>This is a prototype. Users persist in browser <code className="font-mono">localStorage</code>; no real backend or SMTP is wired. Credential emails are simulated via the demo outbox below.</span>
          </div>
        </div>

        <aside className="space-y-3 min-w-0">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="size-4 text-[var(--color-primary)]" /> Demo outbox
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Last {outbox.length || 0} simulated provisioning emails.</p>
            <div className="mt-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {outbox.length === 0 && <div className="text-xs text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">No emails yet. Create a user to see one here.</div>}
              {outbox.map(e => (
                <button key={e.id} onClick={() => setModalEntry(e)} className="text-left panel p-2.5 hover:border-primary/40">
                  <div className="text-xs font-medium truncate">{e.subject}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{e.to}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(e.sentAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {creating && (
        <UserFormDialog
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={(data) => {
            const { outbox: entry } = create(data);
            setCreating(false);
            setModalEntry(entry);
          }}
        />
      )}

      {editing && (
        <UserFormDialog
          key={editing.id}
          mode="edit"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(data) => {
            update(editing.id, data);
            setEditing(null);
          }}
        />
      )}

      {modalEntry && <CredentialsModal entry={modalEntry} onClose={() => setModalEntry(null)} />}
    </AppShell>
  );
}
