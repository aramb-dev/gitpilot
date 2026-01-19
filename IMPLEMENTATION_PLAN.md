# GitPilot Implementation Plan

**Last Updated**: 2025-01-19
**Goal**: A powerful, bulk GitHub management tool for repositories, issues, pull requests, and organization members.

---

## Current State Summary

| Feature | Completion | Status |
|---------|-----------|--------|
| Repository Management | ~80% | Functional, missing UX polish |
| Issue Management | ~90% | Production-ready |
| Pull Request Management | ~60% | Partially implemented |
| Member Management | 0% | Placeholder only |
| Authentication | 95% | Robust, scope gaps |
| Data Layer | 85% | Well-implemented |
| Testing | ~20% | Significant gaps |

**Critical Blockers**:
- Missing `delete_repo` OAuth scope (deletion operations may fail)
- Missing `write:org` OAuth scope (member management not possible)

---

## PRIORITY 1: OAuth Scope Expansion (BLOCKER)

**Why**: Required for repository deletion and organization member management.

**File**: `src/lib/auth.ts`

- [ ] Add `delete_repo` to OAuth scopes
  - Currently only has: `read:user`, `repo`, `read:org`
  - Required for: DELETE /repos/{owner}/{repo} operations
  - Update authorization params scope string
  - Update token.scopes array in JWT callback

- [ ] Add `write:org` to OAuth scopes
  - Required for: Organization member management
  - Enables: invite, remove, update member roles
  - Update authorization params scope string
  - Update token.scopes array in JWT callback

- [ ] Update scope descriptions in `src/types/account.ts`
  - Add description for `delete_repo`
  - Add description for `write:org`

- [ ] Test scope requests manually
  - Verify GitHub prompts user for new permissions
  - Confirm tokens include new scopes

---

## PRIORITY 2: Pull Request Management Parity

**Why**: PRs are at 60% completion while issues are at 90%. Users expect feature parity.

### 2.1 PR Operations Library

**File**: `src/lib/github/prs.ts` (NEW)

- [ ] Create `src/lib/github/prs.ts` following pattern of `src/lib/github/issues.ts`
  - [ ] `normalizePR(raw: GitHubPRResponse): PullRequest`
  - [ ] `addLabels(accessToken, pr, labels)`
  - [ ] `removeLabels(accessToken, pr, labels)`
  - [ ] `setLabels(accessToken, pr, labels)`
  - [ ] `addAssignees(accessToken, pr, assignees)`
  - [ ] `removeAssignees(accessToken, pr, assignees)`
  - [ ] `requestReviewers(accessToken, pr, reviewers)`
  - [ ] `removeReviewers(accessToken, pr, reviewers)`
  - [ ] `executeBulkAction()` for PR operations

### 2.2 PR API Route Enhancements

**File**: `src/app/api/github/prs/actions/route.ts`

- [ ] Implement label operations in bulk actions endpoint
  - Action type: `add_labels`, `remove_labels`, `set_labels`
  - Validation for label arrays

- [ ] Implement assignee operations in bulk actions endpoint
  - Action type: `assign`, `unassign`
  - Validation for assignee arrays

- [ ] Implement reviewer operations in bulk actions endpoint
  - Action type: `request_reviewers`, `remove_reviewers`
  - PR-specific feature (not in issues)

**File**: `src/app/api/github/prs/route.ts`

- [ ] Fix filter implementations
  - Pass labels to GitHub API (currently accepted but ignored)
  - Pass assignees to GitHub API
  - Pass author to GitHub API
  - Implement search functionality

### 2.3 PR UI Components

**File**: `src/components/dashboard/prs/PRsPageClient.tsx`

- [ ] Extract labels dynamically from PR data (like IssuesPageClient does)
- [ ] Extract assignees dynamically from PR data
- [ ] Remove empty array placeholders for availableLabels/availableAssignees

- [ ] Add merge method selector UI
  - Dropdown for: merge, squash, rebase
  - Pass selected method to bulk action

- [ ] Add commit message input for merge
  - Optional text field
  - Pass to merge action

- [ ] Add pagination controls UI
  - Create `src/components/dashboard/prs/PRListPagination.tsx`
  - Follow pattern of `IssueListPagination.tsx`

- [ ] Create PR detail/preview panel
  - `src/components/dashboard/prs/PRPreview.tsx`
  - Follow pattern of `IssuePreview.tsx`

### 2.4 PR Testing

- [ ] `src/app/api/github/prs/route.test.ts` (NEW)
- [ ] `src/app/api/github/prs/actions/route.test.ts` (NEW)
- [ ] `src/lib/github/prs.test.ts` (NEW)
- [ ] `src/components/dashboard/prs/PRCard.test.tsx` (NEW)

---

## PRIORITY 3: Organization Member Management

**Why**: Complete placeholder feature, enables bulk member operations.

### 3.1 Type Definitions

**File**: `src/types/member.ts` (NEW)

- [ ] Define `OrganizationMember` interface
- [ ] Define `MemberRole` type (admin, member, billing_manager, maintainer)
- [ ] Define `MemberInvitation` interface
- [ ] Define `Team` interface
- [ ] Define `TeamMembership` interface

### 3.2 Member Operations Library

**File**: `src/lib/github/members.ts` (NEW)

- [ ] `fetchOrgMembers(accessToken, org, role?)`
- [ ] `inviteMember(accessToken, org, email, role, teams?)`
- [ ] `removeMember(accessToken, org, username)`
- [ ] `updateMemberRole(accessToken, org, username, role)`
- [ ] `fetchPendingInvitations(accessToken, org)`
- [ ] `cancelInvitation(accessToken, org, invitationId)`
- [ ] `listTeams(accessToken, org)`
- [ ] `addMemberToTeam(accessToken, org, team, username)`
- [ ] `removeMemberFromTeam(accessToken, org, team, username)`

### 3.3 Member API Routes

**Directory**: `src/app/api/github/members/` (NEW)

- [ ] `src/app/api/github/members/route.ts`
  - GET: List members for an org

- [ ] `src/app/api/github/members/[username]/route.ts`
  - DELETE: Remove member

- [ ] `src/app/api/github/memberships/route.ts`
  - PUT: Add/update member role

- [ ] `src/app/api/github/invitations/route.ts`
  - GET: List pending invitations
  - POST: Create new invitation

- [ ] `src/app/api/github/invitations/[id]/route.ts`
  - DELETE: Cancel invitation

### 3.4 Member UI Components

**File**: `src/app/dashboard/members/page.tsx` (REPLACE)

- [ ] Remove placeholder "Coming Soon" content
- [ ] Implement full member management interface

**New Components** (following issue management patterns):

- [ ] `src/components/dashboard/members/MemberList.tsx`
  - Table layout with member rows
  - Checkbox selection for bulk operations

- [ ] `src/components/dashboard/members/MemberRow.tsx`
  - Avatar, name, role, team badges
  - Action dropdown

- [ ] `src/components/dashboard/members/MemberFilters.tsx`
  - Filter by role, team, status

- [ ] `src/components/dashboard/members/BulkMemberActions.tsx`
  - Bulk remove, bulk role change
  - Fixed bottom bar when members selected

- [ ] `src/components/dashboard/members/InviteMemberModal.tsx`
  - Email input, role selector, team multi-select

### 3.5 Member Testing

- [ ] `src/lib/github/members.test.ts` (NEW)
- [ ] `src/app/api/github/members/*.test.ts` (NEW)
- [ ] `src/components/dashboard/members/*.test.tsx` (NEW)

---

## PRIORITY 4: Repository Management Enhancements

**Why**: Improve UX for existing bulk operations.

### 4.1 Progress Tracking

- [ ] Add progress callback to bulk operations
  - Modify `src/app/api/github/repos/route.ts` DELETE endpoint
  - Return progress updates during parallel execution
  - Include: processed count, success count, failed count

- [ ] Update UI to show real-time progress
  - `src/components/dashboard/RepositoriesPage.tsx`
  - Show "Processing 3 of 10..." during bulk operations
  - Display individual item status

### 4.2 Cancellation Support

- [ ] Implement AbortController for bulk operations
  - Pass abort signal to fetch requests
  - Add cancel button to operation modals
  - Clean up partial results on cancellation

### 4.3 Preference Wiring

- [ ] Apply `showArchived` preference
  - Filter out archived repos when false
  - Add UI toggle in filter bar

- [ ] Apply `showForks` preference
  - Filter out forked repos when false
  - Add UI toggle in filter bar

- [ ] Implement theme switching
  - Use `theme` preference from database
  - Add theme provider/context
  - Add theme toggle to settings

### 4.4 Unarchive Functionality

- [ ] Add bulk unarchive operation
  - New endpoint or modify archive endpoint
  - Set `archived: false` via GitHub API
  - Add button to action bar (only when archived repos selected)

### 4.5 Archive Candidate Suggestions

- [ ] Implement inactivity detection
  - Calculate days since last commit
  - Suggest repos inactive for 6+ months
  - Display suggestion badge or filter

---

## PRIORITY 5: Testing Coverage

**Why**: Currently at ~20% coverage. Hooks and components are untested.

### 5.1 Hook Tests (0% → 80%)

- [ ] `src/hooks/useBulkIssueActions.test.ts` (NEW)
- [ ] `src/hooks/useIssues.test.ts` (NEW)
- [ ] `src/hooks/usePullRequests.test.ts` (NEW)
- [ ] `src/hooks/useTokenVerification.test.ts` (NEW)
- [ ] `src/hooks/useIssueFilters.test.ts` (NEW)
- [ ] `src/hooks/useFilterPresets.test.ts` (NEW)
- [ ] `src/hooks/usePreferences.test.ts` (NEW)
- [ ] `src/hooks/useSignOut.test.ts` (NEW)

### 5.2 Component Tests (7% → 40%)

**Issue Components**:
- [ ] `src/components/dashboard/issues/BulkActionBar.test.tsx` (NEW)
- [ ] `src/components/dashboard/issues/IssueFilters.test.tsx` (NEW)
- [ ] `src/components/dashboard/issues/IssueList.test.tsx` (NEW)
- [ ] `src/components/dashboard/issues/IssueRow.test.tsx` (NEW)

**Repository Components**:
- [ ] `src/components/dashboard/RepositoryCard.test.tsx` (NEW)
- [ ] `src/components/dashboard/RepositoryRow.test.tsx` (NEW)
- [ ] `src/components/dashboard/RepositoryActions.test.tsx` (NEW)

**Shared Components**:
- [ ] `src/components/dashboard/ConfirmationModal.test.tsx` (EXPAND)
- [ ] `src/components/dashboard/Pagination.test.tsx` (NEW)

### 5.3 Database Tests (0% → 60%)

- [ ] `src/db/cache.test.ts` (NEW)
- [ ] `src/db/preferences.test.ts` (NEW)
- [ ] `src/db/filter-presets.test.ts` (NEW)
- [ ] Migration tests (NEW)

### 5.4 E2E Tests

- [ ] Set up Playwright or Cypress
- [ ] Critical user journeys:
  - [ ] Sign in flow
  - [ ] Bulk archive repositories
  - [ ] Bulk close issues
  - [ ] Filter presets save/load

---

## PRIORITY 6: UI/UX Polish

**Why**: Improve user experience and complete partial features.

### 6.1 Missing shadcn/ui Components

- [ ] Add `Select` component (for dropdowns)
- [ ] Add `Tooltip` component (for helpful hints)
- [ ] Add `Skeleton` component (for loading states)
- [ ] Add `Popover` component (for rich dropdowns)
- [ ] Add `Tabs` component (for settings pages)
- [ ] Add `Progress` component (for operation progress)

### 6.2 Filter Presets UI

- [ ] Create `src/components/dashboard/FilterPresets.tsx`
  - Save current filters as preset
  - Load saved preset
  - Delete preset
  - Set default preset
- [ ] Add to IssuesPageClient and PRsPageClient
- [ ] Add to RepositoriesPage

### 6.3 Confirmation Modals

- [ ] Add confirmation for close/reopen operations
  - Issues: BulkActionBar should confirm before closing
  - PRs: Confirm before closing/merging
- [ ] Add undo functionality
  - Toast notification with "Undo" button
  - Revert operation within 5 seconds

### 6.4 Settings Pages

- [ ] Implement Billing tab (currently "wip" placeholder)
  - Display usage metrics
  - Show plan information

- [ ] Implement Notifications tab (currently "wip" placeholder)
  - Email notification preferences
  - Browser notification settings

- [ ] Implement Security tab (currently "wip" placeholder)
  - Session management
  - Connected apps display

---

## PRIORITY 7: Safety & Operations

**Why**: Improve operational safety and observability.

### 7.1 Audit Log

- [ ] Create `src/db/schema.ts` audit_log table
  - Fields: id, userId, action, target, details, timestamp
- [ ] Implement logging for bulk operations
  - Log delete, archive, visibility changes
- [ ] Create audit log API route
- [ ] Build audit log viewer in settings

### 7.2 Automatic Cache Invalidation

- [ ] Invalidate cache after bulk operations
  - Issues: Clear issue cache after bulk close/reopen
  - PRs: Clear PR cache after bulk merge/close
  - Repos: Clear repo cache after visibility/archive/delete
- [ ] Implement cache key pattern matching
  - `src/db/cache.ts`: add `invalidateByPattern()` function

### 7.3 Enhanced Error Recovery

- [ ] Retry logic with exponential backoff
  - `src/lib/github/client.ts`: add retry for rate limits
  - Configurable retry count
- [ ] Retry queue for failed bulk operations
  - Store failed operations
  - Allow user to retry failed items

### 7.4 Operation History

- [ ] Track recent operations in session
  - Show last 5 bulk operations
  - Display results summary
- [ ] Allow re-running failed operations
  - "Retry failed" button in results

---

## COMPLETED ITEMS

(Items will be moved here as they are implemented)

---

## CONSIDERATIONS FOR FUTURE WORK

### Low Priority Enhancements
- Schedule bulk operations (cron-like scheduling)
- Soft delete with recovery window
- Advanced search with GitHub Search API
- GraphQL support for complex queries
- Webhook configuration for repo events
- Collaborator management (repo-level permissions)
- Branch protection rules management
- Release management
- GitHub Actions workflow management

### Technical Debt
- Migrate ConfirmationModal inline styles to Tailwind
- Extract dropdown pattern into reusable component
- Consolidate duplicate filter logic
- Add request/response logging for debugging
- Implement proper TypeScript path aliases

---

## NOTES

- All paths relative to `/Volumes/T5 EVOexFAT/GitHub/gitpilot/`
- Follow existing patterns from issue management for consistency
- Refer to `specs/bulk-repository-management.md` for requirements
- Test files should use `.test.ts` or `.test.tsx` suffix
- Use Bun test framework with Happy DOM for components
