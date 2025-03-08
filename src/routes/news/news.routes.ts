import * as HttpStatusCodes from "stoker/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import {insertNewsSchema, patchNewsSchema,selectNewsSchema,} from "../../db/schema.ts";

const tags = ["News"];

export const list = createRoute({
  path: "/news",
  method: "get",
  tags: tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.array(selectNewsSchema),
      }),
      "The list of news"
    ),
  },
});

export const create = createRoute({
  path: "/news",
  method: "post",
  tags: tags,
  request: {},
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: insertNewsSchema,
      }),
      "The created news"
    ),

    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "The request body was invalid"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "The server encountered an error"
    ),
  },
});

export const getOne = createRoute({
  path: "/news/{id}",
  method: "get",
  tags: tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: selectNewsSchema,
      }),
      "The news"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "The news was not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertNewsSchema),
      "The validation error(s)"
    ),
  },
});

export const patch = createRoute({
  path: "/news/{id}",
  method: "patch",
  tags: tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchNewsSchema, "News data to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: patchNewsSchema,
      }),
      "The updated news"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "The news was not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "The validation error(s)"
    ),
  },
});

export const remove = createRoute({
  path: "/news/{id}",
  method: "delete",
  tags: tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "The news was deleted"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "The news was not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error"
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;