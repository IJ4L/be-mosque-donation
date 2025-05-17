import db from "./index.ts";
import { users } from "./schema.ts";
import * as bcrypt from "bcrypt";

async function resetAdmin() {
  try {
    // Delete all existing users
    await db.delete(users);
    
    console.log("Deleted all existing users");
    
    // Admin credentials
    const adminUser = {
      username: "admin",
      phoneNumber: "123456",
      password: await bcrypt.hash("admin123", 10),
      updatedAt: new Date()
    };
    
    // Insert admin user
    await db.insert(users).values(adminUser);
    
    console.log("Admin user has been reset successfully!");
  } catch (error) {
    console.error("Error resetting admin user:", error);
  }
}

// Execute the reset
resetAdmin();