import caption from "./api/caption.js";

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Route /caption → caption.js worker
    if (url.pathname === "/caption") {
        return caption.fetch(context.request, context.env, context);
    }

    // Everything else → static site
    return context.next();
}
