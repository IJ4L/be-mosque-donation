import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "stoker/openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { cors } from "hono/cors";
export function createRouter() {
    return new OpenAPIHono({
        strict: false,
        defaultHook,
    });
}
export default function createApp() {
    const app = createRouter();
    app.use(serveEmojiFavicon("📝"));
    app.use("*", cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }));
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
