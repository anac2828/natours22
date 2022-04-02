import mapboxgl from 'mapbox-gl';

// tour locations
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW5hYzI4MjgiLCJhIjoiY2tja3U5YXdtMXQ1aDJ5bnEwOGh6NGphMiJ9.c325UUJVSc6sO_c97YddPQ';
  const map = new mapboxgl.Map({
    // div container in html
    container: 'map',
    style: 'mapbox://styles/anac2828/ckckx7pom040e1imrt6ilznd2',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  //will allow the map to create the locations for all the tours
  // "bound" is the area that will be displayed in the map
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    // create marker
    const marker = document.createElement('div');
    marker.className = 'marker';

    // add marker to map
    new mapboxgl.Marker({
      element: marker,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p> Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    //Extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  // fits the map to location markers
  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
