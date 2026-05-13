import { Pencil, KeyRound, Power, Trash2 } from "lucide-react";
import type { AdminUser } from "@/lib/atlas/admin-store";

interface Props {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onReset: (u: AdminUser) => void;
  onToggleStatus: (u: AdminUser) => void;
}

export function UserTable({ users, onEdit, onReset, onToggleStatus }: Props) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-secondary)]/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Gender</Th>
                <Th>Exp (yrs)</Th>
                <Th>Specializations</Th>
                <Th>Last login</Th>
                <Th>Created</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-[var(--color-accent)]/20">
                  <Td>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground">{u.email}</div>
                  </Td>
                  <Td><span className="chip chip-accent text-[10px]">{u.userRole}</span></Td>
                  <Td>
                    <span className={`chip text-[10px] ${u.status === "active" ? "" : "opacity-60"}`}>
                      <span className={`size-1.5 rounded-full ${u.status === "active" ? "bg-[var(--color-success)]" : "bg-muted-foreground"}`} />
                      {u.status}
                    </span>
                  </Td>
                  <Td className="text-xs">{u.gender}</Td>
                  <Td className="text-xs text-muted-foreground tabular-nums">{u.yearsExperience != null ? u.yearsExperience : "—"}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1 max-w-[18rem]">
                      {u.specializations.slice(0, 3).map(s => <span key={s} className="chip text-[10px]">{s}</span>)}
                      {u.specializations.length > 3 && <span className="chip text-[10px]">+{u.specializations.length - 3}</span>}
                    </div>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}</Td>
                  <Td className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex items-center gap-1">
                      <IconBtn label="Edit" onClick={() => onEdit(u)}><Pencil className="size-3.5" /></IconBtn>
                      <IconBtn label="Reset access" onClick={() => onReset(u)}><KeyRound className="size-3.5" /></IconBtn>
                      <IconBtn label={u.status === "active" ? "Deactivate" : "Activate"} onClick={() => onToggleStatus(u)}>
                        {u.status === "active" ? <Power className="size-3.5" /> : <Trash2 className="size-3.5" />}
                      </IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={9} className="p-10 text-center text-sm text-muted-foreground">No users match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex flex-col gap-2">
        {users.map(u => (
          <div key={u.id} className="panel p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{u.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
              </div>
              <span className="chip chip-accent text-[10px] shrink-0">{u.userRole}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className={`chip text-[10px]`}>
                <span className={`size-1.5 rounded-full ${u.status === "active" ? "bg-[var(--color-success)]" : "bg-muted-foreground"}`} />
                {u.status}
              </span>
              <span className="chip text-[10px]">{u.gender}</span>
              {u.yearsExperience != null && <span className="chip text-[10px]">{u.yearsExperience} yrs</span>}
            </div>
            {u.specializations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {u.specializations.slice(0, 4).map(s => <span key={s} className="chip text-[10px]">{s}</span>)}
                {u.specializations.length > 4 && <span className="chip text-[10px]">+{u.specializations.length - 4}</span>}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
              <button onClick={() => onEdit(u)} className="flex-1 h-9 rounded-md border border-border text-xs flex items-center justify-center gap-1"><Pencil className="size-3.5" /> Edit</button>
              <button onClick={() => onReset(u)} className="flex-1 h-9 rounded-md border border-border text-xs flex items-center justify-center gap-1"><KeyRound className="size-3.5" /> Reset</button>
              <button onClick={() => onToggleStatus(u)} className="flex-1 h-9 rounded-md border border-border text-xs flex items-center justify-center gap-1">
                {u.status === "active" ? <><Power className="size-3.5" /> Off</> : <><Power className="size-3.5" /> On</>}
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <div className="panel p-10 text-center text-sm text-muted-foreground">No users match.</div>}
      </div>
    </>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-medium py-2.5 px-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 px-3 align-top ${className}`}>{children}</td>;
}
function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="size-8 grid place-items-center rounded-md border border-border hover:border-primary/40 hover:text-foreground text-muted-foreground">
      {children}
    </button>
  );
}
