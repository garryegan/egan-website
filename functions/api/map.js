export async function onRequest(context) {
  try {
    // Query all location rows from your D1 database
    const { results } = await context.env.DB
      .prepare("SELECT * FROM locations ORDER BY id ASC")
      .all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
