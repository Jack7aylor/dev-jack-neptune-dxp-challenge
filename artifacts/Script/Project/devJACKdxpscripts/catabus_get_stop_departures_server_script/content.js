// ================================================
// CATAbus Real-Time Departures (with Route Metadata)
// ================================================

const DEFAULT_STOP_ID = 401;

// ------------------------------------------------
// 1. Embedded GTFS route metadata (static)
// ------------------------------------------------
const ROUTES = [
  { route_id: 22, short: "N",  long: "Martin St/Aaron Dr",        color: "00B0F0", text: "ffffff" },
  { route_id: 25, short: "NV", long: "NV",                       color: "635f5f", text: "ffffff" },
  { route_id: 26, short: "HV", long: "HV",                       color: "b58ef6", text: "ffffff" },
  { route_id: 31, short: "R",  long: "Waupelani Dr",             color: "FF99CC", text: "000000" },
  { route_id: 33, short: "RC", long: "Waupelani Exp",            color: "FF3399", text: "ffffff" },
  { route_id: 34, short: "RP", long: "RP",                       color: "ad146e", text: "ffffff" },
  { route_id: 40, short: "HU", long: "Toftrees/Campus",          color: "7030A0", text: "ffffff" },
  { route_id: 42, short: "NE", long: "Martin St Express",        color: "74fbfd", text: "000000" },
  { route_id: 43, short: "V",  long: "Vairo Boulevard",          color: "FF6600", text: "FFFFFF" },
  { route_id: 44, short: "VE", long: "Vairo Exp",                color: "FF9966", text: "000000" },
  { route_id: 46, short: "W",  long: "Havershire/Farmstead",     color: "FCCC0A", text: "000000" },
  { route_id: 47, short: "WE", long: "Havershire Exp",           color: "7030A0", text: "ffffff" },
  { route_id: 51, short: "RL", long: "Red Link",                 color: "fc0004", text: "ffffff" },
  { route_id: 55, short: "BL", long: "Blue Loop",                color: "0000FF", text: "FFFFFF" },
  { route_id: 57, short: "WL", long: "White Loop",               color: "0d0d0d", text: "ffffff" },
  { route_id: 70, short: "CC", long: "College Avenue Connector", color: "000099", text: "ffffff" },
  { route_id: 71, short: "AC", long: "Atherton Connector",       color: "00B050", text: "FFFFFF" },
  { route_id: 72, short: "H",  long: "Toftrees",                 color: "9966FF", text: "ffffff" },
  { route_id: 98, short: "UP", long: "University/Parkway",       color: "29cbcc", text: "ffffff" }
];

// ------------------------------------------------
// 2. Pull stopId from req.body, req.query, req.parameters
// ------------------------------------------------
function extractStopId(req, fallback) {
    if (!req) return fallback;

    const candidates = [
        req.body && req.body.stopId,
        req.query && req.query.stopId,
        req.parameters && req.parameters.stopId
    ];

    for (const v of candidates) {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
            const n = Number(v);
            if (Number.isFinite(n)) return n;
        }
    }
    return fallback;
}

const stopId = extractStopId(req, DEFAULT_STOP_ID);

// ------------------------------------------------
// 3. Helpers
// ------------------------------------------------
function parseDotNetDate(val) {
    if (!val) return null;
    const m = String(val).match(/\/Date\((\d+)/);
    return m ? new Date(Number(m[1])) : null;
}

function hmFromLocalTimeStr(str) {
    if (!str) return "";
    const m = str.match(/T(\d{2}:\d{2})/);
    return m ? m[1] : "";
}

try {

    // ------------------------------------------------
    // 4. Call CATA's StopDepartures API
    // ------------------------------------------------
    const response = await fetch(
        `https://realtime.catabus.com/InfoPoint/rest/StopDepartures/Get/${stopId}`,
        { method: "GET" }
    );

    const rawText = await response.text();
    const parsed = JSON.parse(rawText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
        result.data = [];
        return complete();
    }

    const stopObj = parsed[0];
    const directions = stopObj.RouteDirections || [];

    const nowUTC = new Date();
    const rows = [];

    // ------------------------------------------------
    // 5. Build merged rows with route metadata
    // ------------------------------------------------
    directions.forEach(dir => {
        const routeId = dir.RouteId;
        const deps = dir.Departures || [];
        const direction = dir.Direction;

        const meta = ROUTES.find(r => r.route_id === routeId) || {};

        deps.forEach(d => {
            const trip = d.Trip || {};

            const etaDate =
                parseDotNetDate(d.ETA) ||
                parseDotNetDate(d.EDT);

            let countdown = null;
            if (etaDate) {
                countdown = Math.max(
                    0,
                    Math.round((etaDate - nowUTC) / 60000)
                );
            }

            rows.push({
                stopId,
                routeId,

                route_short: meta.short || "",
                route_long: meta.long || "",
                route_color: meta.color || "",

                direction,
                headsign: trip.InternalSignDesc || "",

                eta_hm: hmFromLocalTimeStr(d.ETALocalTime || d.EDTLocalTime),
                sdt_hm: hmFromLocalTimeStr(d.SDTLocalTime),
                sta_hm: hmFromLocalTimeStr(d.STALocalTime),

                countdown,
                isRealtime: d.IsRealtime === true
            });
        });
    });

    // Sort by closest arrival
    rows.sort((a, b) => (a.countdown ?? 99999) - (b.countdown ?? 99999));

    result.data = rows;
    complete();

} catch (err) {
    result.data = [{ stopId, error: err.toString() }];
    complete();
}
