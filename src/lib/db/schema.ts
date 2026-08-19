import {
  bigint,
  boolean,
  integer,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { TreeNode } from "@/types/github";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  githubId: bigint("github_id", { mode: "number" }).notNull().unique(),
  githubLogin: text("github_login").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    endpoint: text("endpoint").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expirationTime: bigint("expiration_time", { mode: "number" }),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ...timestamps,
  },
  (table) => ({
    userLastSeenIdx: index("push_subscriptions_user_last_seen_idx").on(
      table.userId,
      table.lastSeenAt,
    ),
  }),
);

export const pushRateLimits = pgTable(
  "push_rate_limits",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userWindowPk: primaryKey({ columns: [table.userId, table.windowStart] }),
    windowStartIdx: index("push_rate_limits_window_start_idx").on(
      table.windowStart,
    ),
  }),
);

export const githubAccounts = pgTable("github_accounts", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  ...timestamps,
});

export const githubInstallations = pgTable("github_installations", {
  installationId: bigint("installation_id", { mode: "number" })
    .primaryKey()
    .notNull(),
  accountId: bigint("account_id", { mode: "number" }).notNull(),
  accountLogin: text("account_login").notNull(),
  accountType: text("account_type").notNull(),
  repositorySelection: text("repository_selection").notNull(),
  connectedByUserId: text("connected_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  suspended: boolean("suspended").default(false).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...timestamps,
});

/**
 * Public, fixed repository snapshots used by the landing-page demo.
 * Authenticated and arbitrary repository content is never written here.
 */
export const githubRepositoryCaches = pgTable(
  "github_repository_caches",
  {
    owner: text("owner").notNull(),
    repo: text("repo").notNull(),
    ref: text("ref").notNull(),
    tree: jsonb("tree").$type<TreeNode[]>().notNull(),
    cachedAt: timestamp("cached_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    repositoryRefPk: primaryKey({
      columns: [table.owner, table.repo, table.ref],
    }),
  }),
);

export const githubRepositoryFiles = pgTable(
  "github_repository_files",
  {
    owner: text("owner").notNull(),
    repo: text("repo").notNull(),
    ref: text("ref").notNull(),
    path: text("path").notNull(),
    sha: text("sha").notNull(),
    content: text("content").notNull(),
    size: integer("size").notNull(),
    isBinary: boolean("is_binary").default(false).notNull(),
    downloadUrl: text("download_url"),
    ...timestamps,
  },
  (table) => ({
    repositoryFilePk: primaryKey({
      columns: [table.owner, table.repo, table.ref, table.path],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type PushRateLimit = typeof pushRateLimits.$inferSelect;
export type GitHubAccount = typeof githubAccounts.$inferSelect;
export type GitHubInstallation = typeof githubInstallations.$inferSelect;
export type GitHubRepositoryCache = typeof githubRepositoryCaches.$inferSelect;
export type GitHubRepositoryFile = typeof githubRepositoryFiles.$inferSelect;
