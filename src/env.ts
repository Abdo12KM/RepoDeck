import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string().min(32),
    GITHUB_APP_CLIENT_ID: z.string().min(1),
    GITHUB_APP_CLIENT_SECRET: z.string().min(1),
    GITHUB_APP_SLUG: z.string().min(1),
    GITHUB_APP_CALLBACK_URL: z.url(),
    GITHUB_APP_INSTALL_CALLBACK_URL: z.url(),
    GITHUB_APP_WEBHOOK_SECRET: z.string().min(1).optional(),
    GITHUB_TOKEN_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "Must be a 32-byte hex key"),
    VAPID_PRIVATE_KEY: z.string().min(1).optional(),
    PUSH_ENDPOINT_EXTRA_HOSTS: z.string().optional(),
    VAPID_SUBJECT: z
      .string()
      .refine(
        (value) => value.startsWith("mailto:") || value.startsWith("https://"),
        "Must be a mailto: or https: URI",
      )
      .optional(),
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  client: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID,
    GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
    GITHUB_APP_SLUG: process.env.GITHUB_APP_SLUG,
    GITHUB_APP_CALLBACK_URL: process.env.GITHUB_APP_CALLBACK_URL,
    GITHUB_APP_INSTALL_CALLBACK_URL:
      process.env.GITHUB_APP_INSTALL_CALLBACK_URL,
    GITHUB_APP_WEBHOOK_SECRET: process.env.GITHUB_APP_WEBHOOK_SECRET,
    GITHUB_TOKEN_ENCRYPTION_KEY: process.env.GITHUB_TOKEN_ENCRYPTION_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    PUSH_ENDPOINT_EXTRA_HOSTS: process.env.PUSH_ENDPOINT_EXTRA_HOSTS,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
});
