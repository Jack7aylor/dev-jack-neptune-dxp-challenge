/**
 * Mapping Feed Service
 * --------------------
 * Handles fetching and processing GTFS-Realtime vehicle data.
 *
 * Responsibilities:
 * - Fetch vehicle positions from the GTFS feed
 * - Create, update, and remove Leaflet markers
 * - Maintain marker consistency between refresh cycles
 * - Update map bounds on first successful load
 * - Update HUD status and error messages
 *
 * This file contains no map initialization logic.
 * It assumes a valid Leaflet map instance already exists.
 */


namespace Mapping {
  function vehicleKey(e: any): string {
    return (
      e?.Vehicle?.Vehicle?.Id ??
      e?.Vehicle?.Vehicle?.Label ??
      e?.Id ??
      Math.random().toString()
    ).toString();
  }

  export async function refreshVehicles(busIcon: any): Promise<void> {
    try {
      setError("");
      setStatus("Fetching vehicles…");

      const resp = await fetch(FEED_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const entities = data?.Entities ?? [];

      const seen = new Set<string>();
      const bounds: [number, number][] = [];
      let count = 0;

      for (const e of entities) {
        const pos = e?.Vehicle?.Position;
        if (!pos) continue;

        const lat = Number(pos.Latitude);
        const lon = Number(pos.Longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

        const key = vehicleKey(e);
        const route = e?.Vehicle?.Trip?.RouteId ?? "";
        const label = e?.Vehicle?.Vehicle?.Label ?? key;

        const popup = `
          <div style="font:13px/1.3 Arial;">
            <div><b>Vehicle</b>: ${label}</div>
            ${route ? `<div><b>Route</b>: ${route}</div>` : ""}
            <div><b>Lat/Lon</b>: ${lat.toFixed(5)}, ${lon.toFixed(5)}</div>
          </div>
        `;

        let m = markers.get(key);
        if (!m) {
          m = L.marker([lat, lon], { icon: busIcon }).addTo(map);
          m.bindPopup(popup);
          markers.set(key, m);
        } else {
          m.setLatLng([lat, lon]);
          m.setPopupContent(popup);
        }

        seen.add(key);
        bounds.push([lat, lon]);
        count++;
      }

      for (const [k, m] of markers.entries()) {
        if (!seen.has(k)) {
          map.removeLayer(m);
          markers.delete(k);
        }
      }

      if (!didFitOnce && bounds.length) {
        map.fitBounds(bounds, { padding: [30, 30] });
        didFitOnce = true;
      }

      const ts = data?.Header?.Timestamp
        ? new Date(Number(data.Header.Timestamp) * 1000)
        : new Date();

      setStatus(`OK — ${count} vehicles • ${ts.toLocaleTimeString()}`);
    } catch (err: any) {
      setStatus("Failed");
      setError(String(err));
    }
  }
}
