import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { string } from "zod";

export const users = pgTable("users", {
  userID: serial("user_id").primaryKey(),
  username: text("username").notNull(),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  donationID: serial("donation_id").primaryKey(),
  donationAmount: text("donation_amount").notNull(),
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

export const mutations = pgTable("mutations", {
  mutationID: serial("mutation_id").primaryKey(),
  mutationType: text("mutation_type").notNull(),
  mutationAmount: integer("mutation_amount").notNull(),
  mutationDescription: text("mutation_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMutationSchema = createSelectSchema(mutations);

export const selectMutationSchema = createSelectSchema(mutations, {
  mutationType: (mutationType) => mutationType,
  mutationAmount: (mutationAmount) => mutationAmount,
  mutationDescription: (mutationDescription) => mutationDescription,
});

export const selectUserSchema = createSelectSchema(users);

export const selectNewsSchema = createSelectSchema(news);

export const insertNewsSchema = createInsertSchema(news, {
  authorID: (authorID) => authorID,
  newsImage: (newsImage) => newsImage,
  newsName: (newsName) => newsName,
  newsDescription: (newsDescription) => newsDescription,
});

export const patchNewsSchema = insertNewsSchema.partial();

export const insertDonationSchema = createInsertSchema(donations, {
  donationAmount: (donationAmount) => donationAmount,
  donationDeduction: (donationDeduction) => donationDeduction,
  donationType: (donationType) => donationType,
  donaturName: (donaturName) => donaturName,
  donaturEmail: (donaturEmail) => donaturEmail,
  donaturMessage: (donaturMessage) => donaturMessage,
});

export const selectDonationSchema = createSelectSchema(donations);
