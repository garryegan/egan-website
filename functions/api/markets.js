export async function onRequest(context) {
    const db = context.env.DB;

    // 1. Load all markets
    const markets = await db.prepare(`
        SELECT market_id, name, website
        FROM Markets
        ORDER BY name ASC
    `).all();

    // 2. Load all hours
    const hours = await db.prepare(`
        SELECT market_id, day_of_week, hours
        FROM MarketHours
        ORDER BY market_id, 
                 CASE day_of_week
                     WHEN 'Monday' THEN 1
                     WHEN 'Tuesday' THEN 2
                     WHEN 'Wednesday' THEN 3
                     WHEN 'Thursday' THEN 4
                     WHEN 'Friday' THEN 5
                     WHEN 'Saturday' THEN 6
                     WHEN 'Sunday' THEN 7
                 END
    `).all();

    // 3. Group hours by market_id
    const hoursByMarket = {};
    for (const h of hours.results) {
        if (!hoursByMarket[h.market_id]) {
            hoursByMarket[h.market_id] = [];
        }
        hoursByMarket[h.market_id].push({
            day: h.day_of_week,
            hours: h.hours
        });
    }

    // 4. Build final JSON structure
    const items = markets.results.map(m => ({
        name: m.name,
        website: m.website,
        hours: hoursByMarket[m.market_id] || []
    }));

    return Response.json({
        Markets: items
    });
}
