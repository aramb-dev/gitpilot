# GitPilot Operations Guide

## Build & Run

- Development: `bun run dev` or `npm run dev`
- Production build: `bun run build` or `npm run build`
- Start production: `bun run start` or `npm run start`
- Package manager: Uses Bun but npm/yarn also supported

## Database

- Generate migrations: `bun run db:generate`
- Run migrations: `bun run db:migrate`
- Push schema: `bun run db:push`
- Database studio: `bun run db:studio`
- ORM: Drizzle with Neon Postgres
- Schema location: `src/db/schema.ts`

## Validation

Run these after implementing to get immediate feedback:

- Lint: `bun run lint` or `npm run lint`
- Type check: `bunx tsc --noEmit` or `npx tsc --noEmit`
- Build check: `bun run build` (validates entire app)

## Tech Stack

- Framework: Next.js 16 (App Router)
- Runtime: React 19
- Language: TypeScript
- Styling: Tailwind CSS 4
- UI Components: Radix UI primitives
- Database: Neon Postgres + Drizzle ORM
- Auth: NextAuth.js with GitHub OAuth
- Icons: Lucide React

## Project Structure

- `src/app/*` - Next.js App Router pages and API routes
- `src/components/*` - React components (UI, dashboard, landing)
- `src/db/*` - Database schema, migrations, and utilities
- `src/lib/*` - Shared utilities and helpers
- `src/types/*` - TypeScript type definitions
- `src/hooks/*` - Custom React hooks

## Key Features

- Bulk GitHub repository management (visibility, deletion, archiving)
- GitHub OAuth authentication
- Repository dashboard with filtering and search
- Pull request and issue management
- Organization member management
