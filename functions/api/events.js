export async function onRequest(context) {
    const db = context.env.DB;

    // 1) Load all events
    const events = await db.prepare(
        `SELECT 
            Event,
            Performer,
            EventDate,
            EventTime,
            Location,
            Comments,
            Status
         FROM Events
         ORDER BY EventDate DESC, EventTime DESC`
    ).all();

    // 2) Derived: DISTINCT event years
    const years = await db.prepare(
        `SELECT DISTINCT strftime('%Y', EventDate) AS year
         FROM Events
         WHERE EventDate IS NOT NULL
         ORDER BY year DESC`
    ).all();

    // 3) Derived: DISTINCT statuses
    const statuses = await db.prepare(
        `SELECT DISTINCT Status
         FROM Events
         WHERE Status IS NOT NULL
         ORDER BY Status`
    ).all();

    return Response.json({
        Events: {
            items: events.results,
            years: years.results,
            statuses: statuses.results
        }
    });
}
