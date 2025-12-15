// ==================================================
// CATAbus Field Catalog for Adaptive Application
// ==================================================

result.data = [
    { name: "stopId",      label: "Stop ID",        type: "Integer", usage: "INPUT" },

    { name: "routeId",     label: "Route ID",       type: "Integer" },
    { name: "route_short", label: "Route",          type: "Text" },
    { name: "route_long",  label: "Route Name",     type: "Text" },
    { name: "route_color", label: "Color",          type: "Text" },

    { name: "direction",   label: "Direction",      type: "Text" },
    { name: "headsign",    label: "Headsign",       type: "Text" },

    { name: "eta_hm",      label: "ETA",            type: "Text" },
    { name: "countdown",   label: "Countdown (min)",type: "Integer" },
    { name: "sdt_hm",      label: "Sched Depart",   type: "Text" },
    { name: "sta_hm",      label: "Sched Arrive",   type: "Text" },

    { name: "isRealtime",  label: "Realtime?",      type: "Boolean" }
];

complete();
