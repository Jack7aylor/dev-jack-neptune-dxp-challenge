namespace Mapping {
    export let map: any;

    export function initMap() {
        HTMLObject.setVisible(true);

        oApp.to(oPage);

        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 200);
            return;
        }

        setTimeout(() => {
            map = L.map("map").setView(
                [59.928778, 10.769944],
                14
            );

            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            setTimeout(() => {
                map.invalidateSize();
            }, 200);
        }, 0);
    }
}
