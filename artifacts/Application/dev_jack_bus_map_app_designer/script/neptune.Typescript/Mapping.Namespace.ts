/**
 * Mapping Public API
 * -----------------
 * Entry point and lifecycle controller for the Mapping system.
 *
 * Responsibilities:
 * - Initialize the Leaflet map (once)
 * - Wire UI events (refresh button)
 * - Start and manage polling lifecycle
 * - Handle resize invalidation
 *
 * This is the ONLY file that should be called directly
 * by SAPUI5 controllers (e.g. onAfterRendering).
 */

namespace Mapping {
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

    const busIcon = createBusIcon();

    $("btnRefresh")?.addEventListener("click", () =>
      refreshVehicles(busIcon)
    );

    refreshVehicles(busIcon);
    pollHandle = setInterval(
      () => refreshVehicles(busIcon),
      POLL_MS
    );

    setTimeout(() => map.invalidateSize(true), 0);
  }

  export function requestResize(): void {
    if (!map) return;
    setTimeout(() => map.invalidateSize(true), 0);
  }
}
