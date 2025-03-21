// Create the basemap tile layer.
var basemap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Create the map object with center and zoom options.
var map = L.map('map', {
  center: [37.09, -95.71],  // Center on the US
  zoom: 5,
  layers: [basemap]  // Default layer
});

// Create layer groups for earthquakes and tectonic plates.
var earthquakeLayer = L.layerGroup();
var tectonicLayer = L.layerGroup(); // Optional for future data

// Add a control to the map to toggle layers.
var overlays = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicLayer
};

L.control.layers(null, overlays).addTo(map);

// Fetch the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to define the style for each earthquake marker.
  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]),
      weight: 0.5,
      opacity: 1,
      color: "white",
      fillOpacity: 0.8,
      radius: getRadius(feature.properties.mag)
    };
  }

  // Function to determine marker color based on depth.
  function getColor(depth) {
    if (depth < 10) {
      return "green";
    } else if (depth < 30) {
      return "yellow";
    } else if (depth < 50) {
      return "orange";
    } else {
      return "red";
    }
  }

  // Function to determine marker radius based on magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add GeoJSON layer to the earthquakeLayer.
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>Magnitude: " + feature.properties.mag +
        "</h3><hr><p>Location: " + feature.properties.place +
        "</p><p>Depth: " + feature.geometry.coordinates[2] + " km</p>"
      );
    }
  }).addTo(earthquakeLayer);

  // Add the earthquake layer to the map.
  earthquakeLayer.addTo(map);

  // Create and add a legend to the map.
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 30, 50],
        colors = ["green", "yellow", "orange", "red"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<div><i style="background:' + colors[i] + '; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></i> ' +
        grades[i] + (grades[i + 1] ? '–' + grades[i + 1] + '</div>' : '+');
    }
    return div;
  };

  legend.addTo(map);
});
