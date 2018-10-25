const map = L.map('map', {
   center: [47.608013, -122.335167],
   zoom: 13,
   layers: [
      Tangram.leafletLayer({
         scene: 'scene.yaml',
         events: {
            click: onMapClick
         }
      })
   ],
   zoomControl: false
});

const here = {
   id: 'j2rzBNQTdbkshKdXfd5P',
   code: 'x7YabyKe1lJ_O6WoHfT3bQ'
};

let startCoordinates = '';

document.getElementById('clear').onclick = clearMap;
document.getElementById('change-start').onclick = addStartingMarker;
addStartingMarker();

async function geocode(query) {
   const url = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${here.id}&app_code=${here.code}&searchtext=${query}`
   const response = await fetch(url);
   const data = await response.json();
   return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
}

async function route(start, end) {
   const mode = document.querySelector('input[name="routing-mode"]:checked').value;
   const url = `https://route.api.here.com/routing/7.2/calculateroute.json?app_id=${here.id}&app_code=${here.code}&waypoint0=geo!${start}&waypoint1=geo!${end}&mode=fastest;${mode};traffic:disabled&routeattributes=shape`
   const response = await fetch(url);
   const data = await response.json();
   return await data.response.route[0];
}

function clearMap() {
   map.eachLayer((layer) => {
      if (!layer.hasOwnProperty('_updating_tangram') && !layer.options.hasOwnProperty('alt')) {
         map.removeLayer(layer);
      }
   });
}

async function addStartingMarker() {
   clearMap();
   const startAddress = document.getElementById('start').value;
   startCoordinates = await geocode(startAddress);
   const startingCircle = L.marker([startCoordinates.Latitude, startCoordinates.Longitude], {alt: 'start'}).addTo(map);
}

async function onMapClick(selection) {
   if (selection.feature) {
      const endCoordinates = `${selection.leaflet_event.latlng.lat},${selection.leaflet_event.latlng.lng}`;
      const routeData = await route(`${startCoordinates.Latitude},${startCoordinates.Longitude}`, endCoordinates);
      const shape = routeData.shape.map(x => x.split(","));
      const poly = L.polyline(shape).addTo(map).snakeIn();
   }
}
