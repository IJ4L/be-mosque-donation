import db from "./index.ts";
import { donations, mutations, news, users } from "./schema.ts";

async function clearDatabase() {
  await db.delete(users);
  await db.delete(news);
  await db.delete(mutations);
  await db.delete(donations);
  process.exit(0);
}

clearDatabase().catch((err) => {
  process.exit(1);
});
