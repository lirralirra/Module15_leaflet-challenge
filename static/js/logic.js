// Define colors for depth ranges using the Viridis color scale
const viridis = [
    "#440154", "#3E4A89", "#31688E", "#35B779", "#A6D96A", "#FDE725"
];

/**
 * Create the map and add layers.
 * @param {Object} earthquakeLayer - Layer containing earthquake markers.
 */
function createMap(earthquakeLayer) {
    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create the map object with options.
    let map = L.map("map", {
        center: [0, 0], // Centered at (0, 0)
        zoom: 2,
        layers: [streetmap, earthquakeLayer]
    });

    // Create a layer control and add it to the map.
    L.control.layers(null, { "Earthquakes": earthquakeLayer }, { collapsed: false }).addTo(map);

    // Call the function to create the legend
    createLegend(map);
}

/**
 * Create markers for each earthquake.
 * @param {Object} data - GeoJSON data of earthquakes.
 */
function createMarkers(data) {
    // Initialize an array to hold earthquake markers.
    let quakeMarkers = [];

    // Loop through features in the GeoJSON data.
    data.features.forEach(quake => {
        let coords = quake.geometry.coordinates;
        let magnitude = quake.properties.mag;
        let depth = coords[2];
        let color = getColor(depth); // Determine marker color based on depth

        // Create a circle marker for each earthquake.
        let quakeMarker = L.circleMarker([coords[1], coords[0]], {
            radius: magnitude * 3, // Scale marker size by magnitude
            fillColor: color,
            color: '#000', // Outline color
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        }).bindPopup(
            `<h3>Location: ${quake.properties.place}</h3>
            <p>Magnitude: ${magnitude}</p>
            <p>Depth: ${depth} km</p>`
        );

        quakeMarkers.push(quakeMarker);
    });

    // Create a layer group from the quake markers array and pass it to createMap function.
    createMap(L.layerGroup(quakeMarkers));
}

/**
 * Determine marker color based on depth.
 * @param {Number} depth - Depth of the earthquake.
 * @returns {String} - Hex color code.
 */
function getColor(depth) {
    if (depth > -10 && depth <= 10) return viridis[0];   // colors for different depths
    if (depth > 10 && depth <= 30) return viridis[1];
    if (depth > 30 && depth <= 50) return viridis[2];
    if (depth > 50 && depth <= 70) return viridis[3];
    if (depth > 70 && depth <= 90) return viridis[4];
    return viridis[5];
}

/**
 * Create a discrete legend for the map.
 * @param {Object} map - Leaflet map object.
 */
function createLegend(map) {
    // Set up the legend control.
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        // Define the depth ranges for the legend
        const limits = ['-10 to 10', '10 to 30', '30 to 50', '50 to 70', '70 to 90', '90+'];

        // Add title for the legend
        div.innerHTML = "<h4>Depth (km)</h4>";

        // Add discrete colored boxes and labels
        limits.forEach((limit, index) => {
            div.innerHTML += `
                <div>
                    <i style="
                        background: ${viridis[index]};
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        margin-right: 8px;
                        margin-top: -5px;
                        border: 0px solid #000;
                    "></i>
                    <span>${limit}</span>
                </div>
            `;
        });

        return div;
    };

    // Adding the legend to the map
    legend.addTo(map);
}

// Fetch earthquake data and create markers
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(createMarkers);
