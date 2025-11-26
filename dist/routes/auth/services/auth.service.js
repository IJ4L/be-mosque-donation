import db from "../../../db/index.js";
import { users } from "../../../db/schema.js";
import { eq, sql } from "drizzle-orm";
class AuthService {
    async login(credentials) {
        try {
            const { identifier, password } = credentials;
            const userResult = await db
                .select()
                .from(users)
                .where(sql `${users.username} = ${identifier} OR ${users.phoneNumber} = ${identifier}`)
                .limit(1);
            if (userResult.length === 0) {
                return {
                    success: false,
                    error: "Username atau nomor telepon tidak ditemukan",
                };
            }
            const user = userResult[0];
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                data: {
                    ...userWithoutPassword,
                    userPassword: user.password,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat mencari user",
            };
        }
    }
    async getUserById(userID) {
        try {
            const userResult = await db
                .select()
                .from(users)
                .where(eq(users.userID, userID))
                .limit(1);
            if (userResult.length === 0) {
                return {
                    success: false,
                    error: "User tidak ditemukan",
                };
            }
            const { password: _, ...userWithoutPassword } = userResult[0];
            return {
                success: true,
                data: userWithoutPassword,
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat mengambil data user",
            };
        }
    }
    async getFirstUser() {
        try {
            const userResult = await db.select().from(users).limit(1);
            if (userResult.length === 0) {
                return {
                    success: false,
                    error: "User tidak ditemukan",
                };
            }
            const { password: _, ...userWithoutPassword } = userResult[0];
            return {
                success: true,
                data: userWithoutPassword,
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat mengambil data user",
            };
        }
    }
    async updateUser(userID, updateData) {
        try {
            const existingUser = await this.getUserById(userID);
            if (!existingUser.success) {
                return existingUser;
            }
            const updatePayload = {
                username: updateData.username,
                phoneNumber: updateData.phoneNumber,
                updatedAt: new Date(),
            };
            await db.update(users).set(updatePayload).where(eq(users.userID, userID));
            const updatedUser = await this.getUserById(userID);
            return updatedUser;
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat update user",
            };
        }
    }
    async updatePassword(userID, passwordData, hashedNewPassword) {
        try {
            const userResult = await db
                .select()
                .from(users)
                .where(eq(users.userID, userID))
                .limit(1);
            if (userResult.length === 0) {
                return {
                    success: false,
                    error: "User tidak ditemukan",
                };
            }
            return {
                success: true,
                data: userResult[0].password,
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat update password",
            };
        }
    }
    async saveNewPassword(userID, hashedPassword) {
        try {
            await db
                .update(users)
                .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
                .where(eq(users.userID, userID));
            return {
                success: true,
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat menyimpan password baru",
            };
        }
    }
    async checkUserExists(username, phoneNumber) {
        try {
            const existingUser = await db
                .select()
                .from(users)
                .where(sql `${users.username} = ${username} OR ${users.phoneNumber} = ${phoneNumber}`)
                .limit(1);
            return {
                success: true,
                data: existingUser.length > 0,
            };
        }
        catch (error) {
            return {
                success: false,
                error: "Terjadi kesalahan saat memeriksa user",
            };
        }
    }
}
export default new AuthService();
