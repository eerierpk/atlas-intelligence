import { useEffect } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { HospitalPlacement } from "@/lib/fixtures/hospitals";

function FitBounds({ rows }: { rows: HospitalPlacement[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = rows.map((r) => L.latLng(r.lat, r.lng));
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0]!, 5);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 6 });
  }, [map, rows]);
  return null;
}

export function HospitalPlacementsMap({ rows }: { rows: HospitalPlacement[] }) {
  return (
    <MapContainer
      center={[18, 10]}
      zoom={2}
      minZoom={2}
      maxBounds={[
        [-85, -200],
        [85, 200],
      ]}
      maxBoundsViscosity={0.7}
      className="z-0 h-[min(480px,56vh)] w-full rounded-md [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:max-w-[90%]"
      scrollWheelZoom={false}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds rows={rows} />
      {rows.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={8}
          pathOptions={{
            color: "#0e7490",
            fillColor: "#22d3ee",
            fillOpacity: 0.88,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 200 }}>
              <div style={{ fontWeight: 600 }}>{r.city}</div>
              <div style={{ opacity: 0.75 }}>{r.country}</div>
              <div style={{ marginTop: 6 }}>
                {r.siteType} · {r.year}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>{r.modalityContext}</div>
              <div style={{ marginTop: 6, fontSize: 10, opacity: 0.65 }}>{r.source}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
