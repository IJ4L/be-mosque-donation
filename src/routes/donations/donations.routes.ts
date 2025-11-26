import * as HttpStatusCodes from "stoker/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { selectDonationSchema } from "../../db/schema.js";

export const create = createRoute({
  method: "post",
  path: "/donations",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.object({
          token: z.string(),
          redirect: z.string(),
        }),
      }),
      "Donation created"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Invalid donation"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Error creating donation"
    ),
  },
});

export const callback = createRoute({
  method: "post",
  path: "/donations/notification",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.object({
          order_id: z.string(),
          transaction_status: z.string(),
          fraud_status: z.string(),
          status_code: z.string(),
          status_message: z.string(),
        }),
      }),
      "Callback received"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Invalid callback"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Error processing callback"
    ),
  },
});

export const get = createRoute({
  method: "get",
  path: "/donations",
  request: {
    query: z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().default(10),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.object({
          donations: z.array(selectDonationSchema),
          pagination: z.object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            totalPages: z.number(),
          }),
        }),
      }),
      "Donations retrieved"
    ),
  },
});

export const excel = createRoute({
  method: "get",
  path: "/donations/excel",
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Excel file with all donations",
      content: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
          schema: { type: "string", format: "binary" },
        },
      },
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Error generating Excel file"
    ),
  },
});

export const getTopDonations = createRoute({
  method: "get",
  path: "/donations/top",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.array(selectDonationSchema),
      }),
      "Top donations retrieved"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Error retrieving top donations"
    ),
  },
});

export type CreateRoute = typeof create;
export type GetRoute = typeof get;
export type CallbackRoute = typeof callback;
export type ExcelRoute = typeof excel;
export type GetTopDonationsRoute = typeof getTopDonations;
