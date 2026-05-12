import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight, ShieldCheck, Sparkles, Lock, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AGENTS } from "@/lib/atlas/agents";
import { useAtlas } from "@/lib/atlas/store";
import { SignupWizard } from "@/components/auth/SignupWizard";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAtlas();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email."); return; }
    if (password.length < 4) { setError("Password is too short."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    login(email);
    navigate({ to: "/dashboard" });
  };

  const demoLogin = () => { login("demo.user@medintel.io"); navigate({ to: "/dashboard" }); };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden border-r border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[var(--color-info)]/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] grid place-items-center accent-glow">
            <Activity className="size-5 text-[var(--color-primary-foreground)]" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">MedIntel Atlas</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Healthcare Infrastructure Portal</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-lg">
          <div className="chip chip-accent mb-5"><Sparkles className="size-3" /> AI-Assisted Procurement Intelligence</div>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Decide on medical equipment and clinical infrastructure with the <span className="text-[var(--color-primary)]">clarity of a trading desk</span>.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Atlas unifies imaging platforms, diagnostics equipment and adjacent clinical infrastructure from across the global medical technology industry — OEMs, distributors and integrators — in one decision-intelligence workspace —
            with rationale, confidence and provenance behind every recommendation.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { v: "16+", l: "Systems indexed (demo)" },
              { v: "Industry", l: "MedTech supplier landscape" },
              { v: String(AGENTS.length), l: "Worker agents" },
            ].map(s => (
              <div key={s.l} className="glass-panel rounded-lg p-3 text-center">
                <div className="text-2xl font-semibold text-mono text-[var(--color-primary)]">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="size-3.5" />
          For planning &amp; procurement intelligence only — not diagnostic guidance.
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] grid place-items-center">
              <Activity className="size-4" />
            </div>
            <div className="font-semibold">MedIntel Atlas</div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Access your healthcare infrastructure workspace.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <Field label="Work email">
              <input
                type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                className="w-full h-10 px-3 rounded-md bg-[var(--color-input)] border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            <Field label="Password">
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-md bg-[var(--color-input)] border border-border focus:border-primary outline-none text-sm"
              />
            </Field>
            {error && <div className="text-xs text-[var(--color-destructive)]">{error}</div>}

            <button
              type="submit" disabled={loading}
              className="h-10 mt-1 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Authenticating…" : <>Sign in <ArrowRight className="size-4" /></>}
            </button>

            <button type="button" onClick={demoLogin} className="h-10 rounded-md border border-border hover:border-primary/40 text-sm flex items-center justify-center gap-2">
              <Lock className="size-3.5" /> Continue as Demo User
            </button>
          </form>

          <div className="divider my-6" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            By signing in you acknowledge that Atlas provides procurement &amp; planning intelligence only and is <strong className="text-foreground">not a diagnostic tool</strong>.
            All AI-generated guidance includes confidence indicators and provenance metadata.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
