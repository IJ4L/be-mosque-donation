import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCodes from "stoker/http-status-codes";
export const get = createRoute({
    path: "/images/{filename}",
    method: "get",
    request: {
        params: z.object({
            filename: z.string().describe("Name of the image file"),
        }),
    },
    responses: {
        [HttpStatusCodes.OK]: {
            content: {
                "image/jpeg": {
                    schema: { type: "string", format: "binary" },
                },
                "image/png": {
                    schema: { type: "string", format: "binary" },
                },
                "image/webp": {
                    schema: { type: "string", format: "binary" },
                },
            },
            description: "The requested image",
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(z.object({
            message: z.string(),
        }), "The image was not found"),
    },
});
