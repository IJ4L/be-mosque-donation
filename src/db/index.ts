import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import env from "../env.js";
import * as schema from "./schema.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, {
  schema: schema,
});

export default db;