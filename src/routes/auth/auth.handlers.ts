import * as HttpStatusCodes from "stoker/http-status-codes";
import authService from "./services/auth.service.js";
import type { AppRouteHandler } from "../../lib/types.js";

import type {
  LoginRoute,
  UpdateUserRoute,
  GetUserRoute,
  UpdatePasswordRoute,
} from "./auth.routes.js";

import {
  PasswordUtils,
  ValidationUtils,
  ResponseUtils,
  TransformUtils,
} from "./utils/auth.utils.js";

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  try {
    const rawCredentials = await c.req.json();
    const credentials = TransformUtils.sanitizeLoginCredentials(rawCredentials);

    const validation = ValidationUtils.validateLoginCredentials(credentials);
    if (!validation.isValid) {
      return c.json(
        ResponseUtils.createValidationErrorResponse(validation.errors),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const userResult = await authService.login(credentials);
    if (!userResult.success) {
      return c.json(
        ResponseUtils.createErrorResponse(userResult.error!),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const user = userResult.data as any;
    const isPasswordValid = await PasswordUtils.comparePassword(
      credentials.password,
      user.userPassword
    );

    if (!isPasswordValid) {
      return c.json(
        ResponseUtils.createErrorResponse("Password salah"),
        HttpStatusCodes.UNAUTHORIZED
      );
    }

    const { userPassword, ...userWithoutPassword } = user;
    const transformedUser = {
      ...userWithoutPassword,
      updatedAt: userWithoutPassword.updatedAt.toISOString(),
    };

    return c.json(
      {
        message: "Login berhasil",
        data: transformedUser,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Terjadi kesalahan saat login"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const updateUser: AppRouteHandler<UpdateUserRoute> = async (c) => {
  try {
    const userID = parseInt(c.req.param("userID"));
    const rawUserData = await c.req.json();
    const userData = TransformUtils.sanitizeUpdateUserData(rawUserData);

    const validation = ValidationUtils.validateUpdateUserData(userData);
    if (!validation.isValid) {
      return c.json(
        ResponseUtils.createValidationErrorResponse(validation.errors),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const updateResult = await authService.updateUser(userID, userData);
    if (!updateResult.success) {
      const statusCode = updateResult.error?.includes("tidak ditemukan")
        ? HttpStatusCodes.NOT_FOUND
        : HttpStatusCodes.INTERNAL_SERVER_ERROR;

      return c.json(
        ResponseUtils.createErrorResponse(updateResult.error!),
        statusCode
      );
    }

    const transformedUser = {
      ...updateResult.data!,
      updatedAt: updateResult.data!.updatedAt.toISOString(),
    };

    return c.json(
      {
        message: "Data user berhasil diperbarui",
        data: transformedUser,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Terjadi kesalahan saat update user"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getUser: AppRouteHandler<GetUserRoute> = async (c) => {
  try {
    const userResult = await authService.getFirstUser();
    if (!userResult.success) {
      return c.json(
        ResponseUtils.createErrorResponse(userResult.error!),
        HttpStatusCodes.NOT_FOUND
      );
    }

    const transformedUser = {
      ...userResult.data!,
      updatedAt: userResult.data!.updatedAt.toISOString(),
    };

    return c.json(
      {
        message: "Data user berhasil diambil",
        data: transformedUser,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse(
        "Terjadi kesalahan saat mengambil data user"
      ),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const updatePassword: AppRouteHandler<UpdatePasswordRoute> = async (
  c
) => {
  try {
    const userID = parseInt(c.req.param("userID"));
    const passwordData = await c.req.json();

    const validation = ValidationUtils.validatePasswordUpdateData(passwordData);
    if (!validation.isValid) {
      return c.json(
        ResponseUtils.createValidationErrorResponse(validation.errors),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const userResult = await authService.updatePassword(
      userID,
      passwordData,
      ""
    );
    if (!userResult.success) {
      return c.json(
        ResponseUtils.createErrorResponse(userResult.error!),
        HttpStatusCodes.NOT_FOUND
      );
    }

    const currentPasswordHash = userResult.data as any;
    const isCurrentPasswordValid = await PasswordUtils.comparePassword(
      passwordData.currentPassword,
      currentPasswordHash
    );

    if (!isCurrentPasswordValid) {
      return c.json(
        ResponseUtils.createErrorResponse("Password saat ini tidak cocok"),
        HttpStatusCodes.UNAUTHORIZED
      );
    }

    const hashedNewPassword = await PasswordUtils.hashPassword(
      passwordData.newPassword
    );

    const saveResult = await authService.saveNewPassword(
      userID,
      hashedNewPassword
    );
    if (!saveResult.success) {
      return c.json(
        ResponseUtils.createErrorResponse(saveResult.error!),
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return c.json(
      ResponseUtils.createSuccessResponse("Password berhasil diperbarui", null),
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse(
        "Terjadi kesalahan saat update password"
      ),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
