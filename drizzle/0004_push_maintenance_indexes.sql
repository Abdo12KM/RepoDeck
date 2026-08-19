CREATE INDEX "push_rate_limits_window_start_idx" ON "push_rate_limits" USING btree ("window_start");
--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_last_seen_idx" ON "push_subscriptions" USING btree ("user_id","last_seen_at");
