import db from "./index.ts";
import { donations, mutations, news, users } from "./schema.ts";

async function clearDatabase() {
  await db.delete(users);
  await db.delete(news);
  await db.delete(mutations);
  await db.delete(donations);
  console.log('All data deleted.');
  process.exit(0);
}

clearDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
