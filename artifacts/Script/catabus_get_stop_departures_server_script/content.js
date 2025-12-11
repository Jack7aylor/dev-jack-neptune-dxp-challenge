// ================================================
// CATAbus Real-Time Departures (Neptune JSON version)
// ================================================

let stopId = 401;

// Allow override via tile/URL parameter ?stopId=401
if (req && req.parameters && req.parameters.stopId) {
    stopId = Number(req.parameters.stopId);
}

// Parse .NET /Date(1765452180000-0500)/ into JS Date (UTC instant)
function parseDotNetDate(val) {
    if (!val) return null;
    const m = String(val).match(/\/Date\((\d+)/);
    if (!m) return null;
    return new Date(Number(m[1])); // UTC-based instant
}

// Take a LocalTime string like "2025-12-11T06:55:00"
// and return "06:55"
function hmFromLocalTimeStr(str) {
    if (!str) return "";
    const m = String(str).match(/T(\d{2}:\d{2})/);
    return m ? m[1] : "";
}

try {
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
    const rows = [];

    const nowUTC = new Date(); // we stay in UTC for countdown math

    directions.forEach(dir => {
        const routeId = dir.RouteId;
        const direction = dir.Direction;
        const deps = dir.Departures || [];

        deps.forEach(d => {
            const trip = d.Trip || {};

            // Use ETA (or EDT as fallback) from /Date(...)/
            const etaDate =
                parseDotNetDate(d.ETA) || parseDotNetDate(d.EDT);

            let countdown = null;
            if (etaDate) {
                countdown = Math.max(
                    0,
                    Math.round((etaDate - nowUTC) / 60000)
                );
            }

            rows.push({
                // Basic identifiers
                stopId,
                routeId,
                direction,
                headsign: trip.InternalSignDesc || "",

                // Countdown in minutes
                countdown,
                isRealtime: d.IsRealtime === true,

                // Display times (from *LocalTime* fields, no extra TZ magic)
                eta_hm: hmFromLocalTimeStr(
                    d.ETALocalTime || d.EDTLocalTime
                ),
                sdt_hm: hmFromLocalTimeStr(d.SDTLocalTime),
                sta_hm: hmFromLocalTimeStr(d.STALocalTime),

                // Raw local time strings (if you ever want them in the UI)
                ETALocalTime: d.ETALocalTime,
                EDTLocalTime: d.EDTLocalTime,
                SDTLocalTime: d.SDTLocalTime,
                STALocalTime: d.STALocalTime
            });
        });
    });

    // Sort by soonest bus
    rows.sort((a, b) => (a.countdown ?? 99999) - (b.countdown ?? 99999));

    // Adaptive Table expects a flat array of rows
    result.data = rows;
    complete();

} catch (err) {
    result.data = [{ stopId, error: err.toString() }];
    complete();
}
