# GitPilot Implementation Plan

**Last Updated**: 2026-01-19
**Goal**: A powerful, bulk GitHub management tool for repositories, issues, pull requests, and organization members.

## Pending (highest priority first)
- P0: Expand GitHub OAuth scopes to include `delete_repo` and `admin:org` (or `write:org` as needed); update auth scope string + JWT token scopes; confirm GitHub consent flow (`src/lib/auth.ts`), `PermissionsDisplay`, and `SCOPE_DESCRIPTIONS`.
- P0: Unify repository selection across repos/issues/PRs with org selection: drive available repos from `/api/github/repos` (selected orgs + cache) instead of direct GitHub calls in `src/app/dashboard/issues/page.tsx` and `src/app/dashboard/prs/page.tsx`.
- P1: Create `src/lib/github/prs.ts` (normalize PRs, merged detection, list across repos with filters, bulk operations); resolve missing PR fields (additions/commits/merged) via detail fetch or adjusted model; move `/api/github/prs/route.ts` and `/api/github/prs/actions/route.ts` to shared lib; add validation + tests.
- P1: PR UX parity: dedicated PR filters (labels, assignees, author, review requested, search, draft/merged), merge method + commit message input, reviewer/label/assignee bulk actions, pagination UI aligned with preferences, and a PR preview panel.
- P1: Implement organization member management end-to-end: types (`src/types/member.ts`), GitHub member library, API routes, UI components, and tests (per `specs/organization-member-management.md`).
- P2: Issue UX parity: add author/mentioned filters, expose set/unassign label & assignee actions, and optional close comment in bulk action UI; ensure hooks + API support these fields.
- P2: Repository management gaps: add `fork` to the normalized Repository model; apply `showArchived`/`showForks` preferences; fix visibility filter values; add sorting; add bulk unarchive; add visibility-change confirmation; require repo-name typing for delete; add archive candidate suggestions.
- P2: Bulk operation UX: progress tracking + cancellation for repo/issue/PR operations; surface per-item status/results.
- P2: Cache invalidation after bulk operations: use `invalidateCacheByPrefix`/refresh flags for repos/issues/PRs updates so actions do not return stale lists.
- P3: Filter presets redesign: align schema with issue/PR/repo filters, add manage UI (save/delete/default) across pages, and update API to store per-context presets.
- P3: Settings tabs (billing/notifications/security) replace WIP placeholders with real controls and data.
- P3: Theme preference wiring with a theme provider and consistent app-wide theming (respect `preferences.theme`).
- P3: Safety/ops: audit log, operation history, retry/backoff for rate limits, and retry failed bulk operations.
- P4: Testing coverage: hooks, components, PR/member APIs, cache invalidation, and E2E flows.

## Completed
- Specs added for issues, pull requests, and organization members.

## Specs
- `specs/bulk-repository-management.md`
- `specs/bulk-issue-management.md`
- `specs/bulk-pull-request-management.md`
- `specs/organization-member-management.md`
