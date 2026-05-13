import { useState, type FormEvent } from "react";
import { X, UserPlus } from "lucide-react";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { GENDER_OPTIONS, SPECIALIZATION_OPTIONS } from "@/lib/atlas/specializations";
import type { AdminUser } from "@/lib/atlas/admin-store";
import type { UserRole } from "@/lib/atlas/store";

const ROLE_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Healthcare Professional", label: "Healthcare Professional" },
  { value: "Healthcare Expert", label: "Healthcare Expert" },
  { value: "Business / Stakeholder", label: "Business / Stakeholder" },
  { value: "Admin", label: "Admin" },
];

interface Props {
  initial?: AdminUser;
  onClose: () => void;
  onSubmit: (data: Omit<AdminUser, "id" | "createdAt" | "lastLoginAt" | "status">) => void;
  mode: "create" | "edit";
}

export function UserFormDialog({ initial, onClose, onSubmit, mode }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<UserRole | null>(initial?.userRole ?? null);
  const [gender, setGender] = useState<string | null>(initial?.gender ?? null);
  const [specs, setSpecs] = useState<string[]>(initial?.specializations ?? []);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Valid email is required.");
    if (!role) return setError("Role is required.");
    if (!gender) return setError("Gender is required.");
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      userRole: role,
      gender: gender as AdminUser["gender"],
      specializations: specs,
      title: title.trim() || undefined,
      department: department.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full sm:max-w-xl rounded-t-lg sm:rounded-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-[var(--color-surface)]/95 backdrop-blur p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-[var(--color-accent)]/60 grid place-items-center"><UserPlus className="size-4 text-[var(--color-primary)]" /></div>
            <div>
              <div className="text-sm font-semibold">{mode === "create" ? "Create user" : "Edit user"}</div>
              <div className="text-[11px] text-muted-foreground">Admin provisioning · prototype</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="size-9 grid place-items-center rounded-md border border-border hover:border-primary/40"><X className="size-4" /></button>
        </div>

        <form onSubmit={submit} className="p-4 grid gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name *">
              <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Jane Doe" autoFocus />
            </Field>
            <Field label="Work email *">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input" placeholder="jane@hospital.org" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Role *">
              <SearchableCombobox
                options={ROLE_OPTIONS}
                value={role}
                onChange={(v) => setRole(v as UserRole | null)}
                placeholder="Select role"
                searchPlaceholder="Search roles…"
              />
            </Field>
            <Field label="Gender *">
              <SearchableCombobox
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                placeholder="Select gender"
                searchPlaceholder="Search…"
              />
            </Field>
          </div>

          <Field label="Specializations" hint="Multi-select from clinical & operational taxonomy. Self-identified — not credential verification.">
            <SearchableCombobox
              multiple
              options={SPECIALIZATION_OPTIONS}
              value={specs}
              onChange={setSpecs}
              placeholder="Add specializations…"
              searchPlaceholder="Search 80+ specializations…"
              maxChips={6}
            />
          </Field>

          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Job title"><input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Imaging Director" /></Field>
            <Field label="Department"><input value={department} onChange={e => setDepartment(e.target.value)} className="input" placeholder="Radiology" /></Field>
            <Field label="Phone"><input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+1 555 0100" /></Field>
          </div>

          {error && <div className="text-xs text-[var(--color-destructive)]">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="h-10 px-3 rounded-md border border-border text-sm">Cancel</button>
            <button type="submit" className="h-10 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium">
              {mode === "create" ? "Create & queue email" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input { width: 100%; height: 2.75rem; border-radius: 0.375rem; border: 1px solid var(--color-border); background: var(--color-input); padding: 0 0.75rem; font-size: 0.875rem; outline: none; }
        .input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 40%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-muted-foreground leading-relaxed">{hint}</span>}
    </label>
  );
}
