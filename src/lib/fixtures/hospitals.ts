// Illustrative hospital placements (DEMO DATASET — NOT REAL).
export type SiteType = "Public" | "Private" | "Academic";

export interface HospitalPlacement {
  id: string;
  country: string;
  countryCode: string; // ISO-2 for map dot grouping
  city: string;
  siteType: SiteType;
  modalityContext: string;
  year: number;
  source: "Demo dataset";
}

const COUNTRIES: { country: string; code: string; cities: string[] }[] = [
  { country: "United States", code: "US", cities: ["Boston", "Chicago", "Houston", "Seattle", "Atlanta"] },
  { country: "Germany", code: "DE", cities: ["Berlin", "Munich", "Hamburg", "Cologne"] },
  { country: "United Kingdom", code: "GB", cities: ["London", "Manchester", "Edinburgh"] },
  { country: "France", code: "FR", cities: ["Paris", "Lyon", "Marseille"] },
  { country: "Japan", code: "JP", cities: ["Tokyo", "Osaka", "Fukuoka"] },
  { country: "Brazil", code: "BR", cities: ["São Paulo", "Rio de Janeiro"] },
  { country: "India", code: "IN", cities: ["Mumbai", "Bangalore", "Delhi"] },
  { country: "United Arab Emirates", code: "AE", cities: ["Dubai", "Abu Dhabi"] },
  { country: "Australia", code: "AU", cities: ["Sydney", "Melbourne"] },
  { country: "Canada", code: "CA", cities: ["Toronto", "Vancouver"] },
  { country: "Netherlands", code: "NL", cities: ["Amsterdam", "Utrecht"] },
  { country: "Singapore", code: "SG", cities: ["Singapore"] },
];

const SITE_TYPES: SiteType[] = ["Public", "Private", "Academic"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getHospitalPlacements(deviceId: string, modality: string): HospitalPlacement[] {
  const seed = hash(deviceId) || 7;
  const rows: HospitalPlacement[] = [];
  let i = 0;
  for (const c of COUNTRIES) {
    const n = 1 + ((seed + i) % 3);
    for (let k = 0; k < n; k++) {
      const city = c.cities[(seed + i + k) % c.cities.length];
      const siteType = SITE_TYPES[(seed + i * 3 + k) % SITE_TYPES.length];
      const year = 2018 + ((seed + i + k * 7) % 8);
      rows.push({
        id: `${deviceId}-h${i}-${k}`,
        country: c.country,
        countryCode: c.code,
        city,
        siteType,
        modalityContext: `${modality} replacement / fleet expansion`,
        year,
        source: "Demo dataset",
      });
      i++;
    }
  }
  return rows;
}

// Approximate lat/lng -> SVG coords for a 1000x500 equirectangular map.
export function projectLatLng(lat: number, lng: number, w = 1000, h = 500) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  US: { lat: 39, lng: -97 },
  DE: { lat: 51, lng: 10 },
  GB: { lat: 54, lng: -2 },
  FR: { lat: 46, lng: 2 },
  JP: { lat: 36, lng: 138 },
  BR: { lat: -10, lng: -55 },
  IN: { lat: 22, lng: 79 },
  AE: { lat: 24, lng: 54 },
  AU: { lat: -25, lng: 134 },
  CA: { lat: 56, lng: -106 },
  NL: { lat: 52, lng: 5 },
  SG: { lat: 1, lng: 103 },
};

export const REGION_CONTEXT: Record<string, string> = {
  US: "Typical procurement involves capital committees, GPO contracts, and multi-year service agreements.",
  DE: "Procurement often runs through hospital networks (Klinikverbünde) with formal tender processes.",
  GB: "NHS trusts use national framework agreements; capital approval cycles vary by region.",
  FR: "GHT (groupements hospitaliers de territoire) frequently coordinate large-scale equipment procurement.",
  JP: "Long-standing OEM relationships and regional distributors drive most procurement paths.",
  BR: "Mixed public/private procurement with import-tax considerations factoring into capex.",
  IN: "Tier-1 city academic centers lead premium adoption; tier-2 cities favor mid-tier configurations.",
  AE: "Healthcare-cluster bulk purchasing is common; flagship configurations often selected.",
  AU: "Public-sector tenders and large private hospital groups drive most placements.",
  CA: "Provincial health authorities centralize procurement; capital plans are multi-year.",
  NL: "Hospital alliances coordinate procurement; emphasis on value-based care metrics.",
  SG: "Cluster-led procurement (NHG, NUHS, SingHealth) with strong emphasis on AI maturity.",
};
