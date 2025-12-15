/**
 * Global Leaflet typings
 * ----------------------
 * Declares the Leaflet `L` object as a global symbol.
 *
 * This project loads Leaflet via a <script> tag (no bundler),
 * so TypeScript must be informed that `L` exists at runtime.
 *
 * IMPORTANT:
 * * - `L` must be declared exactly once
 * - Do NOT put logic in this file
 */


declare const L: any;