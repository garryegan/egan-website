export async function onRequest(context) {
    const db = context.env.DB;

    // 1) Load all restaurants
    const restaurants = await db.prepare(
        `SELECT 
            Letter,
            Cuisine,
            Restaurant,
            Location,
            Visit_Date,
            Comments
         FROM Restaurants
         ORDER BY Letter ASC, Restaurant ASC`
    ).all();

    // 2) Derived: DISTINCT cuisines
    const cuisines = await db.prepare(
        `SELECT DISTINCT Cuisine
         FROM Restaurants
         WHERE Cuisine IS NOT NULL AND Cuisine <> ''
         ORDER BY Cuisine ASC`
    ).all();

    // 3) Derived: DISTINCT visit years
    const years = await db.prepare(
        `SELECT DISTINCT strftime('%Y', Visit_Date) AS year
         FROM Restaurants
         WHERE Visit_Date IS NOT NULL AND Visit_Date <> ''
         ORDER BY year DESC`
    ).all();

    return Response.json({
        Restaurants: {
            items: restaurants.results,
            cuisines: cuisines.results,
            years: years.results
        }
    });
}
