result.data = [
    { name: "routeId", label: "Route", type: "Integer" },
    { name: "direction", label: "Direction", type: "Text" },

    { name: "eta_hm", label: "ETA", type: "Text" },
    { name: "countdown", label: "Countdown (min)", type: "Integer" },
    { name: "trip_InternalSignDesc", label: "Headsign", type: "Text" },

    { name: "sdt_hm", label: "Sched Depart", type: "Text" },
    { name: "sta_hm", label: "Sched Arrive", type: "Text" },

    { name: "isRealtime", label: "Realtime?", type: "Boolean" },
    { name: "StopStatusReportLabel", label: "Status", type: "Text" },

    { name: "Dev", label: "Deviation", type: "Text" },
    { name: "ModeReportLabel", label: "Mode", type: "Text" },
    { name: "PropertyName", label: "Property", type: "Text" },

    { name: "trip_GtfsTripId", label: "GTFS Trip", type: "Text" },
    { name: "trip_StopSequence", label: "Stop Seq", type: "Integer" },
    { name: "trip_TripDirection", label: "Trip Direction", type: "Text" }
];

complete();
