import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "stoker/openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import type { AppBindings } from "./types.ts";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(serveEmojiFavicon("📝"));

  app.notFound(notFound);
  app.onError(onError);
  return app;
}