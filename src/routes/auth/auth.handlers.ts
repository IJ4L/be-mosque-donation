import db from "../../db/index.ts";
import { users } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type {
  LoginRoute,
  UpdateUserRoute,
  GetUserRoute,
  UpdatePasswordRoute,
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
    const { username, phoneNumber } = await c.req.json();

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

    const updateData = {
      username,
      phoneNumber,
      updatedAt: new Date(),
    };

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

export const updatePassword: AppRouteHandler<UpdatePasswordRoute> = async (c) => {
  try {
    const userID = parseInt(c.req.param("userID"));
    const { currentPassword, newPassword } = await c.req.json();
    
    console.log(`Attempting password update for userID: ${userID}`);
    
    if (!currentPassword || !newPassword) {
      return c.json(
        { message: "Password saat ini dan password baru harus diisi", data: null },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userID, userID))
      .limit(1);

    if (existingUser.length === 0) {
      console.log("User not found in database");
      return c.json(
        { message: "User tidak ditemukan", data: null },
        HttpStatusCodes.NOT_FOUND
      );
    }    console.log(`User found: ${existingUser[0].username}`);
    
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser[0].password
    );

    console.log(`Password comparison result: ${isCurrentPasswordValid}`);

    if (!isCurrentPasswordValid) {
      return c.json(
        { message: "Password saat ini tidak cocok", data: null },
        HttpStatusCodes.UNAUTHORIZED
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.userID, userID));

    return c.json(
      {
        message: "Password berhasil diperbarui",
        data: null,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat update password:", error);
    return c.json(
      { message: "Terjadi kesalahan saat update password", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
