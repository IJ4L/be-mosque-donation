import db from "./index.ts";
import { users } from "./schema.ts";
import * as bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    // Check if there's already an admin user
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      console.log("Admin user already exists, skipping seeding.");
      return;
    }
      // Admin credentials
    const adminUser = {
      username: "admin",
      phoneNumber: "123456",
      password: await bcrypt.hash("admin123", 10),
      updatedAt: new Date()
    };
    
    // Insert admin user
    await db.insert(users).values(adminUser);
    
    console.log("Admin user successfully created!");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

// Execute the seeder
seedAdmin();
