import { useEffect, useState } from "react";
import { Star, Plus, MessageSquare, X } from "lucide-react";
import { addUserReview, getReviews, getUserReviews, type DeviceReview } from "@/lib/fixtures/reviews";

export function ReviewsSection({ deviceId }: { deviceId: string }) {
  const [open, setOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<DeviceReview[]>([]);
  const fixtureReviews = getReviews(deviceId);

  useEffect(() => { setUserReviews(getUserReviews(deviceId)); }, [deviceId]);

  const all = [...userReviews, ...fixtureReviews];
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;

  return (
    <div className="panel-elevated p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="size-4 text-[var(--color-primary)]" /> Reviews</div>
          <p className="text-xs text-muted-foreground mt-1">Illustrative customer feedback (demo dataset). Your own reviews are stored locally in this browser only.</p>
        </div>
        <div className="flex items-center gap-3">
          <Stars value={avg} />
          <span className="text-xs text-muted-foreground text-mono">{avg.toFixed(1)} · {all.length} reviews</span>
          <button onClick={() => setOpen(true)} className="h-8 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs flex items-center gap-1.5">
            <Plus className="size-3.5" /> Write a review
          </button>
        </div>
      </div>

      <ul className="mt-4 grid md:grid-cols-2 gap-3">
        {all.slice(0, 8).map(r => (
          <li key={r.id} className="rounded-md border border-border p-3 bg-[var(--color-surface)]/60">
            <div className="flex items-center justify-between gap-2">
              <Stars value={r.rating} />
              <span className="text-[10px] text-muted-foreground text-mono">{r.date}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold">{r.title}</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.body}</p>
            <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground">{r.reviewerRole}</span>
              <div className="flex gap-1 flex-wrap">
                {r.tags.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <ReviewModal
          onClose={() => setOpen(false)}
          onSubmit={(r) => {
            const created = addUserReview(deviceId, r);
            setUserReviews(prev => [created, ...prev]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`size-3.5 ${n <= Math.round(value) ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}

type DraftRating = 0 | DeviceReview["rating"];

function ReviewModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Omit<DeviceReview, "id" | "date">) => void }) {
  const [rating, setRating] = useState<DraftRating>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState("Imaging Lead (anonymized site)");
  const [tags, setTags] = useState("workflow, image quality");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 glass-panel rounded-xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Write a review</div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-md border border-border"><X className="size-3.5" /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Rating</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n as DeviceReview["rating"])}>
                    <Star className={`size-5 ${n <= rating ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              {rating === 0 && (
                <span className="text-[10px] text-muted-foreground">Select 1–5 stars to submit.</span>
              )}
            </div>
          </div>
          <Field label="Title">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="One-line summary"
              className="w-full h-9 px-3 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="Your review">
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary resize-none" />
          </Field>
          <Field label="Reviewer role (anonymized)">
            <input value={role} onChange={e => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={e => setTags(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[var(--color-input)] border border-border text-sm outline-none focus:border-primary" />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={onClose} className="h-9 px-3 rounded-md border border-border text-sm">Cancel</button>
            <button
              type="button"
              disabled={rating === 0}
              title={rating === 0 ? "Choose a star rating first" : undefined}
              onClick={() => {
                if (rating === 0) return;
                onSubmit({
                  rating,
                  title: title || "Review",
                  body: body || "—",
                  reviewerRole: role,
                  tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                });
              }}
              className="h-9 px-3 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              Submit
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Stored only in your browser (localStorage). Not transmitted.</p>
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
