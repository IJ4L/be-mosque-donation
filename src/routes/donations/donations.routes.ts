import * as HttpStatusCodes from "stoker/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { selectDonationSchema } from "../../db/schema.ts";

export const create = createRoute({
    method: "post",
    path: "/donations",
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: selectDonationSchema,
            })    
        , "Donation created"),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Invalid donation"),
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Error creating donation"),
    }
});

export const get = createRoute({
    method: "get",
    path: "/donations",
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: z.array(selectDonationSchema),
            })    
        , "Donations retrieved"),
    }
})

export type CreateRoute = typeof create;
export type GetRoute = typeof get;