import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  userID: serial("user_id").primaryKey(),
  username: text("username").notNull(),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  donationID: serial("donation_id").primaryKey(),
  donationAmount: integer("donation_amount").notNull(),
  donationDeduction: integer("donation_deduction").notNull(),
  donationType: text("donation_type").notNull(),
  donaturName: text("donatur_name").notNull(),
  donaturEmail: text("donatur_email"),
  donaturMessage: text("donatur_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  newsID: serial("news_id").primaryKey(),
  authorID: integer("author_id")
    .notNull()
    .references(() => users.userID),
  newsImage: text("news_image").notNull(),
  newsName: text("news_name").notNull(),
  newsDescription: text("news_description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const selectNewsSchema = createSelectSchema(news);

export const insertNewsSchema = createInsertSchema(news, {
  authorID: (authorID) => authorID,
  newsImage: (newsImage) => newsImage,
  newsName: (newsName) => newsName,
  newsDescription: (newsDescription) => newsDescription,
})
  .required({
    authorID: true,
    newsImage: true,
    newsName: true,
    newsDescription: true,
  })
  .omit({
    newsID: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchNewsSchema = insertNewsSchema.partial();
