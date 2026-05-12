// Synthetic competitor scout output — illustrative only.
import { DEVICES } from "@/lib/atlas/data";

export interface CompetitorRow {
  product: string;
  vendor: string;
  differentiator: string;
  lastSeen: string; // synthetic date
}

export function getCompetitors(deviceId: string, region?: string): CompetitorRow[] {
  const target = DEVICES.find(d => d.id === deviceId);
  if (!target) return [];
  const peers = DEVICES.filter(d => d.modality === target.modality && d.id !== deviceId).slice(0, 4);
  const diffs = [
    "Marketed AI denoising / DL reconstruction stack",
    "Wider bore / improved patient comfort claim",
    "Lower siting / shielding requirements (vendor-stated)",
    "Higher detector row count / faster rotation",
    "Helium-free / sealed magnet positioning",
    "Cloud-native protocol management offering",
  ];
  const today = new Date();
  return peers.map((p, i) => {
    const d = new Date(today.getTime() - (3 + i * 5) * 86400000);
    return {
      product: p.name + (region ? ` (${region})` : ""),
      vendor: p.vendor,
      differentiator: diffs[(deviceId.length + i) % diffs.length],
      lastSeen: d.toISOString().slice(0, 10),
    };
  });
}
