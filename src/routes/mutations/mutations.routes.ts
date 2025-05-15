import * as HttpStatusCodes from "stoker/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { selectMutationSchema } from "../../db/schema.ts";

export const get = createRoute({
    method: "get",
    path: "/mutations",
    request: {
        query: z.object({
            page: z.coerce.number().int().positive().default(1),
            limit: z.coerce.number().int().positive().default(10)
        })
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: z.object({
                    mutations: z.array(selectMutationSchema),
                    pagination: z.object({
                        total: z.number(),
                        page: z.number(),
                        limit: z.number(),
                        totalPages: z.number()
                    })
                }),
            })    
        , "Mutations retrieved"),
    }
});

export const excel = createRoute({
    method: "get",
    path: "/mutations/excel",
    responses: {
        [HttpStatusCodes.OK]: {
            description: "Excel file with all mutations",
            content: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                    schema: { type: "string", format: "binary" }
                }
            }
        },
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Error generating Excel file"),
    }
});

export const getSummary = createRoute({
    method: "get",
    path: "/mutations/summary",
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: z.object({
                    income: z.number().describe("Pendapatan"),
                    spending: z.number().describe("Penarikan"),
                    balance: z.number().describe("Selisih")
                }),
            })
        , "Mutation summary retrieved"),
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Error retrieving summary"),
    }
});

export type GetRoute = typeof get;
export type ExcelRoute = typeof excel;
export type SummaryRoute = typeof getSummary;