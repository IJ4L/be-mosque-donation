import pg from "pg";
import env from "../env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
async function main() {
    console.log("Starting database migration...");
    const pool = new pg.Pool({
        connectionString: env.DATABASE_URL,
    });
    const db = drizzle(pool);
    try {
        console.log("Running migrations...");
        await migrate(db, { migrationsFolder: "./src/db/migrations" });
        console.log("Migrations completed successfully!");
    }
    catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
main().catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
});
