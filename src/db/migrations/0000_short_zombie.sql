CREATE TABLE "cached_github_data" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"data_type" text NOT NULL,
	"data" jsonb NOT NULL,
	"etag" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "filter_presets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"filters" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"default_visibility" text DEFAULT 'all' NOT NULL,
	"items_per_page" integer DEFAULT 30 NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"show_archived" boolean DEFAULT false NOT NULL,
	"show_forks" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_cached_github_data_user_id" ON "cached_github_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cached_github_data_key" ON "cached_github_data" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_cached_github_data_expires_at" ON "cached_github_data" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_filter_presets_user_id" ON "filter_presets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_filter_presets_is_default" ON "filter_presets" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences" USING btree ("user_id");