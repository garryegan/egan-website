// ============================================================
// map.js — FINAL D1‑ONLY version with hard‑coded mapId
// ============================================================

window.markers = [];
let infoWindow;

// ------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------
const MAP_ID = "edb3893cd0036f4f";

// ------------------------------------------------------------
// INIT MAP (D1 data must already be loaded into window.allData)
// ------------------------------------------------------------
window.initMap = function () {

    const allData = window.allData;
    if (!allData || !allData.Maps) {
        console.error("❌ D1 returned no Maps data");
        return;
    }

    const mapData = allData.Maps;
	console.log("Trips from D1:", mapData.trips);

    if (!mapData.map_data || !mapData.trips) {
        console.error("❌ map_data or trips missing from D1");
        return;
    }

    // --------------------------------------------------------
    // BUILD LOOKUPS (tripId → tripName, tripId → tripColor)
    // --------------------------------------------------------
    const tripNames = {};
    const tripColors = {};

    mapData.trips.forEach(t => {
        tripNames[t.TripID] = t.trip;     // human-readable trip name
        tripColors[t.TripID] = t.color;   // trip colour from legend
    });

    // --------------------------------------------------------
    // CREATE MAP
    // --------------------------------------------------------
    window.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 21.0, lng: 0.0 },
        zoom: 2.3,
        mapId: MAP_ID
    });

    infoWindow = new google.maps.InfoWindow();

    // --------------------------------------------------------
    // BUILD EVERYTHING
    // --------------------------------------------------------
	createMarkers(mapData.map_data.features, tripNames, tripColors);
	buildLegend(mapData.trips);
	refreshCaption();   // <-- NEW

    const toggleButton = document.getElementById("legendToggle");
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleLegend);
    }
};

// ------------------------------------------------------------
// CREATE MARKERS — restored original behaviour
// ------------------------------------------------------------
function createMarkers(features, tripNames, tripColors) {
    const bounds = new google.maps.LatLngBounds();

    markers = features.map(feature => {
        const { coordinates } = feature.geometry;
        const { name, trip_id } = feature.properties;

        const position = { lat: coordinates[1], lng: coordinates[0] };

        // Resolve trip name + colour
        const trip = tripNames[trip_id] || "Unknown trip";
        const color = tripColors[trip_id] || "#666";

        // Original marker element
        const markerEl = document.createElement("div");
        markerEl.className = "advanced-marker";
        markerEl.style.backgroundColor = color;
        markerEl.style.border = "1px solid black";
        markerEl.style.borderRadius = "50%";
        markerEl.style.width = "10px";
        markerEl.style.height = "10px";
        markerEl.title = name;

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: markerEl
        });

        marker.trip_id = trip_id;

        // Hover scale
        markerEl.addEventListener("mouseenter", () => {
            markerEl.style.transform = "scale(1.4)";
        });
        markerEl.addEventListener("mouseleave", () => {
            markerEl.style.transform = "scale(1)";
        });

        // RESTORED ORIGINAL POPUP EXACTLY
        marker.addListener("gmp-click", () => {
            const html = `
                <div style="max-width:260px; font-family:sans-serif;">
                    <h3 style="margin-top:0; color:#1a5276;">${name}</h3>
                    <p style="margin:4px 0;"><strong>Trip:</strong> ${trip}</p>
                    <p style="margin:4px 0;"><strong>Coordinates:</strong> ${position.lat.toFixed(3)}, ${position.lng.toFixed(3)}</p>
                </div>
            `;
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });

        bounds.extend(position);
        return marker;
    });

    map.fitBounds(bounds);
}

// ------------------------------------------------------------
// FILTER MARKERS BY TRIP — unchanged
// ------------------------------------------------------------
function filterMarkersByTrip(tripID) {
    document.querySelectorAll(".legend-item").forEach(item => {
        const isSelected = item.dataset.tripId === String(tripID);
        item.classList.toggle("legend-selected", isSelected);
    });

    const showAll = tripID === "null";
    const bounds = new google.maps.LatLngBounds();
    let count = 0;

    markers.forEach(marker => {
        const match = showAll || marker.trip_id === parseInt(tripID);
        marker.map = match ? map : null;

        if (match) {
            bounds.extend(marker.position);
            count++;
        }
    });

    if (count > 0) map.fitBounds(bounds);
}

// ------------------------------------------------------------
// BUILD LEGEND — unchanged
// ------------------------------------------------------------
function buildLegend(trips) {
    const legendContainer = document.getElementById("legend");
    legendContainer.innerHTML = "";

    trips
        .filter(t => t.TripID <= 100)
        .forEach(trip => {
            const legendItem = document.createElement("div");
            legendItem.className = "legend-item";
            legendItem.dataset.tripId = trip.TripID;
            legendItem.style.cursor = "pointer";

            // Build the <span> with or without tooltip
            const tooltip = trip.description && trip.description.trim().length > 0
                ? ` title="${trip.description}"`
                : "";

            legendItem.innerHTML = `
                <div class="legend-color" style="background:${trip.color};"></div>
                <span${tooltip}>${trip.trip}</span>
            `;

            legendItem.addEventListener("click", () => filterMarkersByTrip(trip.TripID));
            legendContainer.appendChild(legendItem);
        });

    const allTripsItem = document.createElement("div");
    allTripsItem.className = "legend-item legend-all";
    allTripsItem.dataset.tripId = "null";
    allTripsItem.style.cursor = "pointer";

    allTripsItem.innerHTML = `
        <div class="legend-color" style="background:#666;"></div>
        <span>All Trips</span>
    `;

    allTripsItem.addEventListener("click", () => filterMarkersByTrip("null"));
    legendContainer.appendChild(allTripsItem);
}

// ------------------------------------------------------------
// TOGGLE LEGEND — aligned with HTML + CSS
// ------------------------------------------------------------
function toggleLegend() {
    const legendContainer = document.getElementById("legend");
    const toggleButton = document.getElementById("legendToggle");

    const isVisible = legendContainer.style.display === "block";
    legendContainer.style.display = isVisible ? "none" : "block";
    toggleButton.textContent = isVisible ? "Show Legend" : "Hide Legend";
}

// ------------------------------------------------------------
// UPDATE CAPTION — unchanged
// ------------------------------------------------------------
function updateCaption(caption) {
    const captionElement = document.getElementById("mapCaption");
    captionElement.textContent = caption;
}

async function refreshCaption() {
    console.log("refreshCaption() called");   // TEMP
    const response = await fetch("/caption");
    const data = await response.json();
    console.log("caption data:", data);       // TEMP
    updateCaption(data.caption);
}
