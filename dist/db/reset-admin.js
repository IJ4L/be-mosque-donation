import db from "./index.js";
import { users } from "./schema.js";
import * as bcrypt from "bcrypt";
async function resetAdmin() {
    try {
        await db.delete(users);
        console.log("Deleted all existing users");
        const adminUser = {
            username: "admin",
            phoneNumber: "123456",
            password: await bcrypt.hash("admin123", 10),
            updatedAt: new Date(),
        };
        await db.insert(users).values(adminUser);
        console.log("Admin user has been reset successfully!");
    }
    catch (error) {
        console.error("Error resetting admin user:", error);
    }
}
resetAdmin();
