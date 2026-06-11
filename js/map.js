export async function onRequest(context) {
    const db = context.env.DB;

    // ------------------------------------------------------------
    // 1. Fetch Trips (IconColour)
    // ------------------------------------------------------------
    const trips = await db.prepare(
        `SELECT TripID, trip, icon_colour
         FROM IconColour
         ORDER BY TripID ASC`
    ).all();

    // ------------------------------------------------------------
    // 2. Fetch Locations (Maps) joined with Trips
    // ------------------------------------------------------------
    const locations = await db.prepare(
        `SELECT 
            Maps.ID,
            Maps.name,
            Maps.address,
            Maps.Country,
            Maps.VisitDate,
            Maps.latitude,
            Maps.longitude,
            Maps.photo,
            Maps.TripID,
            Maps.hide,
            IconColour.trip AS trip_name,
            IconColour.icon_colour AS color
         FROM Maps
         LEFT JOIN IconColour ON Maps.TripID = IconColour.TripID
         WHERE Maps.hide = 0`
    ).all();

    // ------------------------------------------------------------
    // 3. Convert to GeoJSON‑like features (map.js expects this)
    // ------------------------------------------------------------
    const features = locations.results.map(row => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [row.longitude, row.latitude]
        },
        properties: {
            id: row.ID,
            name: row.name,
            address: row.address,
            country: row.Country,
            visit_date: row.VisitDate,
            photo: row.photo,
            trip_id: row.TripID,
            trip: row.trip_name,
            color: row.color
        }
    }));

    // ------------------------------------------------------------
    // 4. Countries visited (derived, not stored)
    // ------------------------------------------------------------
    const countries = await db.prepare(
        `SELECT DISTINCT Country
         FROM Maps
         WHERE hide = 0
         ORDER BY Country ASC`
    ).all();

    // ------------------------------------------------------------
    // 5. Final JSON payload (matches allData.Maps exactly)
    // ------------------------------------------------------------
    return Response.json({
        trips: trips.results,
        map_data: {
            type: "FeatureCollection",
            features
        },
        countries_visited: countries.results
    });
}
