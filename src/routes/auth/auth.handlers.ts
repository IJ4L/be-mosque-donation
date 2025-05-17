import db from "../../db/index.ts";
import { users } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type {
  LoginRoute,
  UpdateUserRoute,
  GetUserRoute,
} from "./auth.routes.ts";
import * as bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  try {
    const { identifier, password } = await c.req.json();

    const user = await db
      .select()
      .from(users)
      .where(
        sql`${users.username} = ${identifier} OR ${users.phoneNumber} = ${identifier}`
      )
      .limit(1);

    if (user.length === 0) {
      return c.json(
        { message: "Username atau nomor telepon tidak ditemukan", data: null },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return c.json(
        { message: "Password salah", data: null },
        HttpStatusCodes.UNAUTHORIZED
      );
    }

    const { password: _, ...userWithoutPassword } = user[0];

    return c.json(
      {
        message: "Login berhasil",
        data: userWithoutPassword,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat login:", error);
    return c.json(
      { message: "Terjadi kesalahan saat login", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const updateUser: AppRouteHandler<UpdateUserRoute> = async (c) => {
  try {
    const userID = parseInt(c.req.param("userID"));
    const { username, phoneNumber, password } = await c.req.json();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userID, userID))
      .limit(1);

    if (existingUser.length === 0) {
      return c.json(
        { message: "User tidak ditemukan", data: null },
        HttpStatusCodes.NOT_FOUND
      );
    }

    const updateData: any = {
      username,
      phoneNumber,
      updatedAt: new Date(),
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db.update(users).set(updateData).where(eq(users.userID, userID));

    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.userID, userID))
      .limit(1);

    const { password: _, ...userWithoutPassword } = updatedUser[0];

    return c.json(
      {
        message: "Data user berhasil diperbarui",
        data: userWithoutPassword,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat update user:", error);
    return c.json(
      { message: "Terjadi kesalahan saat update user", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getUser: AppRouteHandler<GetUserRoute> = async (c) => {
  try {
    const user = await db.select().from(users).limit(1);

    if (user.length === 0) {
      return c.json(
        { message: "User tidak ditemukan", data: null },
        HttpStatusCodes.NOT_FOUND
      );
    }

    const { password: _, ...userWithoutPassword } = user[0];

    return c.json(
      {
        message: "Data user berhasil diambil",
        data: userWithoutPassword,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat mengambil data user:", error);
    return c.json(
      { message: "Terjadi kesalahan saat mengambil data user", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
