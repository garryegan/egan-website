export async function onRequest(context) {
    return Response.json({
        key: context.env.GOOGLE_MAPS_API_KEY
    });
}
