export async function onRequest(context) {
    const db = context.env.DB;

    // 1) Load all map points from D1
    const points = await db.prepare(
        `SELECT 
		name,
		Country,
		latitude,
		longitude,
		TripID,
		VisitDate,
		Description,
		hide
	FROM maps
	WHERE hide IS NULL OR hide = 0`
    ).all();

    // Build GeoJSON FeatureCollection
    const features = points.results.map(row => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [row.longitude, row.latitude]
        },
		properties: {
			name: row.name,
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

    // 2) Load trips from Trips (formerly IconColour)
    const trips = await db.prepare(
        `SELECT 
            TripID,
            trip,
            icon_colour AS color,
			description
         FROM Trips
         ORDER BY TripID`
    ).all();

    // 3) DISTINCT countries visited
    const countries = await db.prepare(
        `SELECT DISTINCT Country 
         FROM maps
         WHERE Country IS NOT NULL AND Country <> ''
         ORDER BY Country`
    ).all();

    return Response.json({
        Maps: {
            map_data,
            trips: trips.results,
            countries_visited: countries.results
        }
    });
}
