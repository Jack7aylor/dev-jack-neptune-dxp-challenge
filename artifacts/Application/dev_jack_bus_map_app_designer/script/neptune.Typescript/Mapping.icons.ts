/**
 * Mapping Icons
 * -------------
 * Factory functions for Leaflet icons used by the map.
 *
 * Currently includes:
 * - Bus / vehicle marker icon
 *
 * Isolated so visual representation can evolve independently
 * (e.g. route colors, selection states, animation).
 */


namespace Mapping {
  export function createBusIcon(): any {
    return L.divIcon({
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
  }
}
