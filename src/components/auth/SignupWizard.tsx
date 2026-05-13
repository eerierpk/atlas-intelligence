import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Loader2, X } from "lucide-react";
import type { UserRole } from "@/lib/atlas/store";

export interface SignupData {
  name: string;
  email: string;
  userRole: UserRole;
  gender?: string;
  yearsExperience?: number;
  specialization?: string;
  credentials?: string;
}

const ROLES: { value: UserRole; description: string }[] = [
  { value: "Student", description: "Learning the field — simplified UI, education-first." },
  { value: "Healthcare Professional", description: "Clinical or technical practitioner — full read access, can run agents." },
  { value: "Healthcare Expert", description: "Content reviewer — can edit device facts and approve curated entries." },
  { value: "Business / Stakeholder", description: "Procurement / strategy — emphasis on ROI, market and TCO views." },
];

export function SignupWizard({ onClose, onComplete }: { onClose: () => void; onComplete: (d: SignupData) => void }) {
  const [step, setStep] = useState(0);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("Healthcare Professional");
  const [gender, setGender] = useState("");
  const [yearsExperience, setYears] = useState<number | "">("");
  const [specialization, setSpecialization] = useState("");
  const [credentials, setCredentials] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!name.trim()) return setError("Name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email.");
      if (password.length < 4) return setError("Password is too short.");
    }
    setStep(s => s + 1);
  };
  const back = () => {
    if (creatingAccount) return;
    setStep(s => Math.max(0, s - 1));
  };

  useEffect(() => {
    if (!creatingAccount) return;
    const t = window.setTimeout(() => {
      setCreatingAccount(false);
      setStep(3);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [creatingAccount]);

  const submit = () => {
    onComplete({
      name, email, userRole,
      gender: gender || undefined,
      yearsExperience: typeof yearsExperience === "number" ? yearsExperience : undefined,
      specialization: specialization || undefined,
      credentials: credentials || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 glass-panel rounded-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Create account</div>
            <div className="text-[11px] text-muted-foreground">
              {creatingAccount ? "Finalizing… · Demo only" : `Step ${step + 1} of 4 · Demo only`}
            </div>
          </div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-md border border-border"><X className="size-3.5" /></button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                creatingAccount
                  ? i < 3
                    ? "bg-[var(--color-primary)]"
                    : i === 3
                      ? "bg-[var(--color-primary)]/40 animate-pulse"
                      : "bg-[var(--color-secondary)]"
                  : i <= step
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-secondary)]"
              }`}
            />
          ))}
        </div>

        {creatingAccount && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-2">
            <Loader2 className="size-9 animate-spin text-[var(--color-primary)]" aria-hidden />
            <div className="text-sm font-medium text-center">Creating your account…</div>
            <p className="text-[11px] text-muted-foreground text-center max-w-[260px] leading-relaxed">
              Provisioning workspace and role (simulated — no server in this prototype).
            </p>
          </div>
        )}

        {!creatingAccount && step === 0 && (
          <div className="flex flex-col gap-3">
            <Field label="Name"><Input value={name} onChange={setName} placeholder="Full name" /></Field>
            <Field label="Email"><Input value={email} onChange={setEmail} placeholder="you@hospital.org" type="email" /></Field>
            <Field label="Password"><Input value={password} onChange={setPassword} type="password" placeholder="••••••••" /></Field>
            <p className="text-[10px] text-muted-foreground">Demo accounts are not secured; do not enter real credentials. Password is not persisted.</p>
          </div>
        )}

        {!creatingAccount && step === 1 && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Choose your role</div>
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setUserRole(r.value)}
                className={`text-left rounded-md border p-3 transition ${userRole === r.value ? "border-primary/60 bg-[var(--color-accent)]/30" : "border-border hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.value}</div>
                  {userRole === r.value && <Check className="size-4 text-[var(--color-primary)]" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
              </button>
            ))}
          </div>
        )}

        {!creatingAccount && step === 2 && (
          <div className="flex flex-col gap-3">
            <Field label="Gender (optional)"><Input value={gender} onChange={setGender} /></Field>
            <Field label="Years of experience (optional)">
              <input type="number" min={0} max={60} value={yearsExperience}
                onChange={e => setYears(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="w-full h-10 px-3 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Specialization">
              <Input value={specialization} onChange={setSpecialization} placeholder="e.g. MRI physics, oncology, biomed" />
            </Field>
            <Field label="Credentials (not verified in demo)">
              <textarea value={credentials} onChange={e => setCredentials(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary resize-none" />
            </Field>
          </div>
        )}

        {!creatingAccount && step === 3 && (
          <div className="text-center py-4">
            <div className="size-14 mx-auto rounded-full bg-[var(--color-primary)]/15 grid place-items-center"><BadgeCheck className="size-7 text-[var(--color-primary)]" /></div>
            <div className="mt-3 text-base font-semibold">Account ready</div>
            <p className="text-xs text-muted-foreground mt-1">You'll sign in as <span className="text-foreground font-medium">{name}</span> with role <span className="chip chip-accent ml-1">{userRole}</span></p>
            {userRole === "Healthcare Expert" && (
              <p className="text-[11px] text-[var(--color-primary)] mt-3">Expert mode unlocks the Intel Expert agent and content review queue.</p>
            )}
          </div>
        )}

        {error && <div className="text-xs text-[var(--color-destructive)] mt-3">{error}</div>}

        <div className="mt-5 flex items-center justify-between">
          {creatingAccount ? (
            <span className="text-[11px] text-muted-foreground">Please wait…</span>
          ) : step > 0 ? (
            <button type="button" onClick={back} className="h-9 px-3 rounded-md border border-border text-sm flex items-center gap-1.5">
              <ArrowLeft className="size-3.5" /> Back
            </button>
          ) : (
            <span />
          )}
          {creatingAccount ? <span /> : step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2) {
                  setCreatingAccount(true);
                } else {
                  next();
                }
              }}
              className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5"
            >
              Continue <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button type="button" onClick={submit} className="h-9 px-4 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm flex items-center gap-1.5">
              Enter Atlas <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary" />
  );
}
