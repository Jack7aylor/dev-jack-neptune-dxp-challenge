/**
 * Mapping DOM Utilities
 * --------------------
 * Helper functions for interacting with HUD / UI elements
 * outside of SAPUI5 controls.
 *
 * Responsibilities:
 * - DOM element lookup
 * - Status text updates
 * - Error message rendering
 *
 * This keeps direct DOM access out of business logic
 * and makes UI updates consistent and centralized.
 */


namespace Mapping {
  export function $(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  export function setStatus(msg: string): void {
    const el = $("status");
    if (el) el.textContent = msg;
  }

  export function setError(msg?: string): void {
    const el = $("error");
    if (el) el.textContent = msg || "";
  }
}
