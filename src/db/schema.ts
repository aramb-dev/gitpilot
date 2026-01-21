import { pgTable, text, timestamp, index, jsonb, integer, boolean } from "drizzle-orm/pg-core";

export const userPreferences = pgTable(
  "user_preferences",
  {
    userId: text("user_id").primaryKey(),
    defaultBranch: text("default_branch").notNull().default("main"),
    defaultVisibility: text("default_visibility").notNull().default("all"), // all, public, private, forks
    itemsPerPage: integer("items_per_page").notNull().default(30),
    theme: text("theme").notNull().default("dark"),
    showArchived: boolean("show_archived").notNull().default(false),
    showForks: boolean("show_forks").notNull().default(true),
    selectedOrgs: jsonb("selected_orgs").notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_user_preferences_user_id").on(table.userId)],
);

export const cachedGithubData = pgTable(
  "cached_github_data",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    key: text("key").notNull(), // e.g., "user_repos", "org_repos:acme"
    dataType: text("data_type").notNull(), // repositories, issues, pulls, etc.
    data: jsonb("data").notNull(),
    etag: text("etag"), // GitHub ETag for conditional requests
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_cached_github_data_user_id").on(table.userId),
    index("idx_cached_github_data_key").on(table.key),
    index("idx_cached_github_data_expires_at").on(table.expiresAt),
  ],
);

export const filterPresets = pgTable(
  "filter_presets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    context: text("context").notNull().default("repositories"), // repositories, issues, pull_requests
    filters: jsonb("filters").notNull(), // { visibility, language, topics, etc. }
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_filter_presets_user_id").on(table.userId),
    index("idx_filter_presets_context").on(table.context),
    index("idx_filter_presets_is_default").on(table.isDefault),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    action: text("action").notNull(), // e.g. "bulk_merge_pr", "bulk_close_issue"
    resourceType: text("resource_type").notNull(), // "pull_request", "issue", "repository", "member"
    details: jsonb("details").notNull(), // { count: 5, success: 3, failed: 2, targets: [...] }
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_user_id").on(table.userId),
    index("idx_audit_logs_created_at").on(table.createdAt),
  ],
);

export const apiMetrics = pgTable(
  "api_metrics",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    endpoint: text("endpoint").notNull(),
    status: integer("status").notNull(),
    attempt: integer("attempt").notNull(),
    waitTimeMs: integer("wait_time_ms").notNull(),
    source: text("source").notNull(), // 'rate_limit', 'server_error', 'success'
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_api_metrics_user_id").on(table.userId),
    index("idx_api_metrics_created_at").on(table.createdAt),
  ],
);
