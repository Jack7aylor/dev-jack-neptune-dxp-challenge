/**
 * Mapping State
 * -------------
 * Centralized, shared state for the Mapping namespace.
 *
 * This file contains:
 * - Leaflet map instance
 * - Application configuration (feed URL, poll interval)
 * - Runtime flags (initialization, bounds fitting)
 * - Active marker registry
 *
 * No DOM access or side effects should occur here.
 * This file acts as the single source of truth for map state.
 */


namespace Mapping {
  export let map: any = null;

  export const FEED_URL =
    "https://realtime.catabus.com/InfoPoint/GTFS-Realtime.ashx?Type=VehiclePosition&debug=true";

  export const POLL_MS = 8000;

  export const markers = new Map<string, any>();

  export let initialized = false;
  export let didFitOnce = false;
  export let pollHandle: any = null;
}
