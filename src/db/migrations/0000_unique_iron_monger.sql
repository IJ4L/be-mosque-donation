CREATE TABLE "donations" (
	"donation_id" serial PRIMARY KEY NOT NULL,
	"donation_amount" text NOT NULL,
	"donation_deduction" integer NOT NULL,
	"donation_type" text NOT NULL,
	"donatur_name" text,
	"phone_number" text,
	"donatur_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mutations" (
	"mutation_id" serial PRIMARY KEY NOT NULL,
	"mutation_type" text NOT NULL,
	"mutation_amount" integer NOT NULL,
	"mutation_description" text,
	"mutation_status" text DEFAULT 'completed',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"news_id" serial PRIMARY KEY NOT NULL,
	"news_image" text NOT NULL,
	"news_name" text NOT NULL,
	"news_description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"phone_number" text NOT NULL,
	"password" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
