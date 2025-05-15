import db from "../../db/index.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { news } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import type {CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute,} from "./news.routes.ts";
import { eq, sql } from "drizzle-orm";
import { parseNewsFormData } from "../util/parse-data.ts";
import { z } from "zod"; // Add this import for validation

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  });

  const { page, limit } = querySchema.parse(c.req.query());
  const offset = (page - 1) * limit;
  const [newss, countResult] = await Promise.all([
    db.select().from(news).offset(offset).limit(limit),
    db.select({ count: sql`count(*)` }).from(news),
  ]);
  
  const total = Number(countResult[0]?.count || 0);

  const totalPages = Math.ceil(total / limit);

  return c.json(
    {
      message: "Successfully get news",
      data: newss,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    },
    HttpStatusCodes.OK
  );
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const newss = await parseNewsFormData(c);
  if (!newss) {
    return c.json(
      { message: "Invalid request body", data: null },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const [insertedNews] = await db.insert(news).values(newss).returning();
  return c.json(
    { message: "Successfully added news", data: insertedNews },
    HttpStatusCodes.OK
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const newss = await db.select().from(news).where(eq(news.newsID, id)).limit(1);

  if (newss.length === 0) {
    return c.json(
      { message: "News not found", data: null },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(
    { message: "Successfully get news", data: newss[0] },
    HttpStatusCodes.OK
  );
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const newss = await parseNewsFormData(c);

  if (!newss) {
    return c.json(
      { message: "Invalid request body", data: null },
      HttpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const [updatedNews] = await db.update(news).set(newss).where(eq(news.newsID, id)).returning();

  if (!updatedNews) {
    return c.json(
      { message: "News not found", data: null },
      HttpStatusCodes.NOT_FOUND
    );
  }

  return c.json(
    { message: "Successfully updated news", data: updatedNews },
    HttpStatusCodes.OK
  );
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const [newsItem] = await db.select().from(news).where(eq(news.newsID, id)).limit(1);
  
  if (!newsItem) {
    return c.json(
      { message: "News not found", data: null },
      HttpStatusCodes.NOT_FOUND
    );
  }

  await db.delete(news).where(eq(news.newsID, newsItem.newsID));
  return c.json({ message: "Successfully deleted news" }, HttpStatusCodes.OK);
};