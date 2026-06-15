export async function onRequest(context) {
    const db = context.env.DB;

    // 1) Load all cooking entries
    const cooking = await db.prepare(
        `SELECT 
            name,
            url,
            comments,
            rank
         FROM Cooking
         ORDER BY rank ASC, name ASC`
    ).all();

    // 2) Derived: DISTINCT ranks used
    const ranks = await db.prepare(
        `SELECT DISTINCT rank
         FROM Cooking
         WHERE rank IS NOT NULL
         ORDER BY rank ASC`
    ).all();

    return Response.json({
        Cooking: {
            items: cooking.results,
            ranks: ranks.results
        }
    });
}
