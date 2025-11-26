import * as HttpStatusCodes from "stoker/http-status-codes";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { selectUserSchema } from "../../db/schema.js";

export const login = createRoute({
  method: "post",
  path: "/auth/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            identifier: z
              .string()
              .min(1, "Username or phone number is required"),
            password: z.string().min(1, "Password is required"),
          }),
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: selectUserSchema.omit({ password: true }),
      }),
      "Login successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Invalid credentials"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Unauthorized"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Server error"
    ),
  },
});

export const updateUser = createRoute({
  method: "put",
  path: "/auth/user/:userID",
  request: {
    params: z.object({
      userID: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            username: z.string().min(1, "Username is required"),
            phoneNumber: z.string().min(1, "Phone number is required"),
          }),
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: selectUserSchema.omit({ password: true }),
      }),
      "User updated successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Invalid input"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "User not found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Server error"
    ),
  },
});

export const getUser = createRoute({
  method: "get",
  path: "/auth/user",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: selectUserSchema.omit({ password: true }),
      }),
      "User retrieved successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "User not found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Server error"
    ),
  },
});

export const updatePassword = createRoute({
  method: "put",
  path: "/auth/password/:userID",
  request: {
    params: z.object({
      userID: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            currentPassword: z.string().min(1, "Current password is required"),
            newPassword: z
              .string()
              .min(6, "New password must be at least 6 characters"),
          }),
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Password updated successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Invalid input"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Current password is incorrect"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "User not found"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
        data: z.null(),
      }),
      "Server error"
    ),
  },
});

export type LoginRoute = typeof login;
export type UpdateUserRoute = typeof updateUser;
export type GetUserRoute = typeof getUser;
export type UpdatePasswordRoute = typeof updatePassword;
