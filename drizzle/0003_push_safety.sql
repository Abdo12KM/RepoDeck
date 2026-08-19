ALTER TABLE "push_subscriptions"
ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE TABLE "push_rate_limits" (
  "user_id" text NOT NULL,
  "window_start" timestamp with time zone NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "push_rate_limits_user_id_window_start_pk" PRIMARY KEY("user_id", "window_start")
);
--> statement-breakpoint
ALTER TABLE "push_rate_limits"
ADD CONSTRAINT "push_rate_limits_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
