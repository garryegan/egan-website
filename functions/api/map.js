export async function onRequest(context) {
    const db = context.env.DB;

    // 1) Load all map points from D1, excluding hidden trips
    const points = await db.prepare(
        `SELECT 
            m.Name,
            m.Country,
            m.Latitude,
            m.Longitude,
            m.TripID,
            m.VisitDate,
            m.Description,
            m.hide
         FROM maps m
         JOIN Trips t ON m.TripID = t.TripID
         WHERE (m.hide IS NULL OR m.hide = 0)
           AND t.Displayed = 0`
    ).all();

    // Build GeoJSON FeatureCollection
    const features = points.results.map(row => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [row.Longitude, row.Latitude]
        },
        properties: {
            name: row.Name,
            country: row.Country,
            trip_id: row.TripID,
            visitdate: row.VisitDate,
            description: row.Description
        }
    }));

    const map_data = {
        type: "FeatureCollection",
        features
    };

    // 2) Load trips for legend, excluding hidden trips
    const trips = await db.prepare(
        `SELECT 
            TripID,
            trip,
            icon_colour AS color,
            description
         FROM Trips
         WHERE Displayed = 0
         ORDER BY TripID`
    ).all();

    // 3) DISTINCT countries visited, excluding hidden trips
    const countries = await db.prepare(
        `SELECT DISTINCT m.Country
         FROM maps m
         JOIN Trips t ON m.TripID = t.TripID
         WHERE m.Country IS NOT NULL 
           AND m.Country <> ''
           AND t.Displayed = 0
         ORDER BY m.Country`
    ).all();

    return Response.json({
        Maps: {
            map_data,
            trips: trips.results,
            countries_visited: countries.results
        }
    });
}
