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
  /** Approximate coordinates for map markers (demo). */
  lat: number;
  lng: number;
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

/** Approximate city centers for demo map markers (ISO-2 | City). */
const CITY_LAT_LNG: Record<string, { lat: number; lng: number }> = {
  "US|Boston": { lat: 42.3601, lng: -71.0589 },
  "US|Chicago": { lat: 41.8781, lng: -87.6298 },
  "US|Houston": { lat: 29.7604, lng: -95.3698 },
  "US|Seattle": { lat: 47.6062, lng: -122.3321 },
  "US|Atlanta": { lat: 33.749, lng: -84.388 },
  "DE|Berlin": { lat: 52.52, lng: 13.405 },
  "DE|Munich": { lat: 48.1374, lng: 11.5755 },
  "DE|Hamburg": { lat: 53.5511, lng: 9.9937 },
  "DE|Cologne": { lat: 50.9375, lng: 6.9603 },
  "GB|London": { lat: 51.5074, lng: -0.1278 },
  "GB|Manchester": { lat: 53.4808, lng: -2.2426 },
  "GB|Edinburgh": { lat: 55.9533, lng: -3.1883 },
  "FR|Paris": { lat: 48.8566, lng: 2.3522 },
  "FR|Lyon": { lat: 45.764, lng: 4.8357 },
  "FR|Marseille": { lat: 43.2965, lng: 5.3698 },
  "JP|Tokyo": { lat: 35.6762, lng: 139.6503 },
  "JP|Osaka": { lat: 34.6937, lng: 135.5023 },
  "JP|Fukuoka": { lat: 33.5904, lng: 130.4017 },
  "BR|São Paulo": { lat: -23.5505, lng: -46.6333 },
  "BR|Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "IN|Mumbai": { lat: 19.076, lng: 72.8777 },
  "IN|Bangalore": { lat: 12.9716, lng: 77.5946 },
  "IN|Delhi": { lat: 28.6139, lng: 77.209 },
  "AE|Dubai": { lat: 25.2048, lng: 55.2708 },
  "AE|Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
  "AU|Sydney": { lat: -33.8688, lng: 151.2093 },
  "AU|Melbourne": { lat: -37.8136, lng: 144.9631 },
  "CA|Toronto": { lat: 43.6532, lng: -79.3832 },
  "CA|Vancouver": { lat: 49.2827, lng: -123.1207 },
  "NL|Amsterdam": { lat: 52.3676, lng: 4.9041 },
  "NL|Utrecht": { lat: 52.0907, lng: 5.1214 },
  "SG|Singapore": { lat: 1.3521, lng: 103.8198 },
};

function coordsFor(countryCode: string, city: string): { lat: number; lng: number } {
  const key = `${countryCode}|${city}`;
  const hit = CITY_LAT_LNG[key];
  if (hit) return { ...hit };
  const cent = COUNTRY_CENTROIDS[countryCode];
  return cent ? { ...cent } : { lat: 0, lng: 0 };
}

function jitterLatLng(lat: number, lng: number, id: string): { lat: number; lng: number } {
  const h = hash(id);
  const dLat = ((h % 200) - 100) / 1200;
  const dLng = (((h / 200) | 0) % 200 - 100) / 1200;
  return { lat: lat + dLat, lng: lng + dLng };
}

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
      const id = `${deviceId}-h${i}-${k}`;
      const base = coordsFor(c.code, city);
      const { lat, lng } = jitterLatLng(base.lat, base.lng, id);
      rows.push({
        id,
        country: c.country,
        countryCode: c.code,
        city,
        siteType,
        modalityContext: `${modality} replacement / fleet expansion`,
        year,
        source: "Demo dataset",
        lat,
        lng,
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
