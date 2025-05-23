import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "production" ? ".env" : ".env.development"
    ),
  })
);

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(9999),
    DATABASE_URL: z.string().default(""),
    LOG_LEVEL: z.string().default("debug"),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    WABLAS_TOKEN: z.string().default(""),
    WABLAS_SECRET: z.string().default(""),
    WABLAS_DOMAIN: z.string().default(""),
    MIDTRANS_SERVER_KEY: z.string().default(""),
    MIDTRANS_CLIENT_KEY: z.string().default(""),
    MIDTRANS_MERCHANT_ID: z.string().default(""),
    MIDTRANS_IS_PRODUCTION: z.string().default("false"),
  })
  .superRefine((input, ctx) => {
    if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "undefined",
        path: ["DATABASE_AUTH_TOKEN"],
        message: "Must be set when NODE_ENV is 'production'",
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
