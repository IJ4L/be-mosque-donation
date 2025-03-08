import { drizzle } from "drizzle-orm/node-postgres";

import env from "../env.js";
import * as schema from "./schema.ts";

const db = drizzle(env.DATABASE_URL, {
  schema: schema,
});

export default db;