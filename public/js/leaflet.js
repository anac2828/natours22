const mapBoxContainer = document.getElementById('map');
const locations = JSON.parse(mapBoxContainer.dataset.locations);

const initialView = locations[0].coordinates;
const markerIcon = L.icon({ iconUrl: '../img/pin.png', iconSize: [25, 32] });

const [lng, lat] = initialView;

var map = L.map('map').setView([lat, lng], 8);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

locations.map((location) => {
  const [lng, lat] = location.coordinates;
  L.marker([lat, lng], { icon: markerIcon })
    .addTo(map)
    .bindPopup(location.description);
});
