declare const L: any;

namespace Mapping {
  export let map: any = null;
  let initialized = false;

  const FEED_URL =
    "https://realtime.catabus.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition&debug=true";

  const POLL_MS = 8000;

  const markers = new Map<string, any>();
  let didFitOnce = false;
  let pollHandle: any = null;

  function $(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  function setStatus(msg: string) {
    const el = $("status");
    if (el) el.textContent = msg;
  }

  function setError(msg?: string) {
    const el = $("error");
    if (el) el.textContent = msg || "";
  }

  function vehicleKey(e: any): string {
    return (
      e?.Vehicle?.Vehicle?.Id ??
      e?.Vehicle?.Vehicle?.Label ??
      e?.Id ??
      Math.random().toString()
    ).toString();
  }

  export function initMap(): void {
    if (initialized) {
      requestResize();
      return;
    }

    const mapDiv = $("map");
    if (!mapDiv) {
      console.warn("Map div not found");
      return;
    }

    initialized = true;

    map = L.map("map").setView([40.7934, -77.86], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const busIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          width:14px;
          height:14px;
          border-radius:50%;
          background:#111827;
          border:2px solid white;
          box-shadow:0 1px 6px rgba(0,0,0,0.35);
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    async function refresh(): Promise<void> {
      try {
        setError("");
        setStatus("Fetching vehicles…");

        const resp = await fetch(FEED_URL, { cache: "no-store" });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

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

    $("btnRefresh")?.addEventListener("click", refresh);

    refresh();
    pollHandle = setInterval(refresh, POLL_MS);

    setTimeout(() => map.invalidateSize(true), 0);
  }

  export function requestResize(): void {
    if (!map) return;
    setTimeout(() => map.invalidateSize(true), 0);
  }
}
