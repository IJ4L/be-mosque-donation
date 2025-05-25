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
    request: {
        query: z.object({
            month: z.string().optional().describe("Bulan dalam format YYYY-MM (contoh: 2025-05)")
        })
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),                data: z.object({
                    income: z.number().describe("Pendapatan"),
                    spending: z.number().describe("Penarikan"),
                    balance: z.number().describe("Selisih"),
                    withdrawableBalance: z.number().describe("Saldo yang dapat dicairkan (lebih dari 1 hari)"),
                    period: z.string().describe("Periode laporan")
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

export const payout = createRoute({
    method: "post",
    path: "/mutations/payout",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        amount: z.number().positive("Jumlah harus lebih dari 0").describe("Jumlah pengeluaran/penarikan"),
                        description: z.string().min(1, "Deskripsi harus diisi").describe("Keterangan pengeluaran/penarikan")
                    })
                }
            }
        }
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: selectMutationSchema,
            })
        , "Payout created successfully"),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Invalid input"),
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Error processing payout"),
    }
});

export const approvePayout = createRoute({
    method: "put",
    path: "/mutations/payout/:mutationID/approve",
    request: {
        params: z.object({
            mutationID: z.string().min(1, "ID mutasi harus diisi")
        })
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                message: z.string(),
                data: selectMutationSchema,
            })
        , "Payout approved successfully"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Payout not found"),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Invalid payout status"),
        [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
            z.object({
                message: z.string(),
                data: z.null(),
            })
        , "Error approving payout"),
    }
});

export type GetRoute = typeof get;
export type ExcelRoute = typeof excel;
export type SummaryRoute = typeof getSummary;
export type PayoutRoute = typeof payout;
export type ApprovePayoutRoute = typeof approvePayout;