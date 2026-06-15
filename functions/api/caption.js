export default {
    async fetch(request, env) {
        const db = env.DB;

        const rows = await db
            .prepare("SELECT Seq, Country FROM CaptionCountriesView ORDER BY Seq;")
            .all();

        const count = rows.results.length;
        const list = rows.results.map(r => r.Country).join(", ");

        const caption =
            `These are the Countries & Territories from The Travelers’ Century Club (TCC) that we have visited (${count}): ` +
            list;

        return new Response(JSON.stringify({ caption }), {
            headers: { "Content-Type": "application/json" }
        });
    }
};
