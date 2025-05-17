ALTER TABLE "news" DROP CONSTRAINT "news_author_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "news" DROP COLUMN "author_id";