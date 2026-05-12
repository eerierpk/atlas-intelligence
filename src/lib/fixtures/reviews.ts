// Synthetic reviews fixture — illustrative only, not real customer feedback.
export interface DeviceReview {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  reviewerRole: string;
  date: string; // YYYY-MM-DD
  tags: string[];
}

const ROLES = [
  "Chief Imaging Technologist (anonymized site)",
  "Medical Physicist",
  "Radiology Department Lead",
  "Biomedical Engineering Supervisor",
  "Procurement Director",
  "Clinical Applications Specialist",
];

const TAG_POOL = ["image quality", "service", "training", "uptime", "workflow", "AI tools", "siting", "ergonomics"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TEMPLATES: { rating: DeviceReview["rating"]; title: string; body: string }[] = [
  { rating: 5, title: "Reliable workhorse for our service line",
    body: "We deployed across two sites and uptime has been excellent. Applications training was solid and the protocol library covers most of our case mix." },
  { rating: 4, title: "Strong clinical fit, watch the service tier",
    body: "Image quality met expectations and DL reconstruction is a real productivity unlock. Negotiate the premium service tier carefully — base coverage was thinner than we expected." },
  { rating: 4, title: "Good ergonomics, fast install",
    body: "Patient throughput increased ~12% after onboarding. The console UX is intuitive for newer techs and reduced time-to-protocol noticeably." },
  { rating: 3, title: "Mixed experience post go-live",
    body: "Solid platform but the integration with our PACS/RIS required additional vendor engineering days. Once stabilized, performance has been consistent." },
  { rating: 5, title: "Significant workflow improvement",
    body: "Auto-positioning and one-click protocols cut our average exam time. AI features feel mature, not gimmicky. Service response has been responsive." },
  { rating: 4, title: "Capex is high — TCO is reasonable",
    body: "Sticker shock at procurement, but cost-per-scan reconciles favorably across a 5-year horizon assuming steady volumes." },
  { rating: 3, title: "Training entitlements were tight",
    body: "Hardware is fine. We burned through included training days quickly and had to extend. Build that into the negotiation." },
  { rating: 5, title: "Excellent for academic workflows",
    body: "Researchers love the protocol flexibility and the open standards integration. Zero complaints on image consistency across techs." },
];

function pickN<T>(arr: T[], seed: number, n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < Math.min(n, arr.length)) {
    s = (s * 9301 + 49297) % 233280;
    const idx = s % arr.length;
    if (!used.has(idx)) { used.add(idx); out.push(arr[idx]); }
  }
  return out;
}

export function getReviews(deviceId: string): DeviceReview[] {
  const seed = hash(deviceId) || 1;
  const count = 4 + (seed % 4); // 4–7 reviews
  const picks = pickN(TEMPLATES, seed, count);
  return picks.map((t, i) => {
    const dayOffset = (seed + i * 37) % 540; // up to ~18mo back
    const d = new Date(Date.now() - dayOffset * 86400000);
    return {
      id: `${deviceId}-r${i}`,
      rating: t.rating,
      title: t.title,
      body: t.body,
      reviewerRole: ROLES[(seed + i) % ROLES.length],
      date: d.toISOString().slice(0, 10),
      tags: pickN(TAG_POOL, seed + i * 11, 2 + (i % 2)),
    };
  });
}

// ---- localStorage user reviews ----
const LS_KEY = "medintel.userReviews.v1";

type Store = Record<string, DeviceReview[]>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function writeStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function getUserReviews(deviceId: string): DeviceReview[] {
  return readStore()[deviceId] ?? [];
}

export function addUserReview(deviceId: string, r: Omit<DeviceReview, "id" | "date">) {
  const store = readStore();
  const review: DeviceReview = {
    ...r,
    id: `${deviceId}-u${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
  };
  store[deviceId] = [review, ...(store[deviceId] ?? [])];
  writeStore(store);
  return review;
}
