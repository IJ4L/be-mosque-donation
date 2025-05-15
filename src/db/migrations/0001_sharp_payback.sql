CREATE TABLE "mutations" (
	"mutation_id" serial PRIMARY KEY NOT NULL,
	"mutation_type" text NOT NULL,
	"mutation_amount" integer NOT NULL,
	"mutation_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
