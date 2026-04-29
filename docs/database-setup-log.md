# Database Setup Session Log

**Date:** January 11, 2026  
**Session:** Initial Drizzle ORM + Neon Postgres setup for GitPilot

## Overview

This document captures the technical decisions and implementation steps from the initial database integration session.

## Architecture Decisions

### Database Choice: Neon Postgres

**Why Neon over Supabase:**
- Already using NextAuth for auth (no need for Supabase Auth)
- No real-time subscription requirements
- No need for Row Level Security (single-tenant data model)
- Simpler mental model: just Postgres, no Supabase-specific APIs
- Serverless with scale-to-zero (perfect for side projects)

**Free Tier Limits:**
- Storage: 0.5GB
- Compute: ~300 hours/month (auto-suspends when idle)
- Branches: 3 splits

### ORM Choice: Drizzle

Selected Drizzle over Prisma for:
- Lighter and faster runtime
- Better fit for simple caching + preferences use case

## Implementation Steps

### 1. Dependencies

```bash
bun add drizzle-orm @neondatabase/serverless
bun add -d drizzle-kit
```

### 2. Configuration

**drizzle.config.ts:**
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 3. Schema Design

**File:** `src/db/schema.ts`

Three main tables were created:

1. **`user_preferences`** - User-specific settings
   - `user_id` (PK), `default_branch`, `default_visibility`
   - `items_per_page`, `theme`, `show_archived`, `show_forks`
   - Timestamps: `created_at`, `updated_at`

2. **`cached_github_data`** - API response cache
   - `id` (PK), `user_id`, `key`, `data_type`
   - `data` (jsonb), `etag`, `expires_at`
   - Indexed on: `user_id`, `key`, `expires_at`

3. **`filter_presets`** - Saved filter configurations
   - `id` (PK), `user_id`, `name`, `filters` (jsonb)
   - `is_default` flag
   - Indexed on: `user_id`, `is_default`

### 4. Database Connection

**File:** `src/db/index.ts`
```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
```

### 5. Package Scripts

Added to `package.json`:
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

### 6. Migration Strategy

Used Neon MCP to apply migrations via temporary branch workflow:
1. Create migration in temporary branch
2. Verify schema changes
3. Apply to main branch
4. Clean up temporary branch

## Project Structure

```
src/db/
├── index.ts          # Database connection
├── schema.ts         # Table definitions
└── migrations/       # Generated migration files
```

## Notes

- Removed Vercel KV from initial scope (Neon-only approach)
- Postgres used for both persistence and caching (with `expires_at` column)
- Plan for periodic cleanup of expired cache rows via cron/edge function
