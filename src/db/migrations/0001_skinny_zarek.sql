ALTER TABLE "filter_presets" ADD COLUMN "context" text DEFAULT 'repositories' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "selected_orgs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_filter_presets_context" ON "filter_presets" USING btree ("context");