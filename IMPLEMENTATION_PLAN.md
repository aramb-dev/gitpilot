# GitPilot Implementation Plan

**Last Updated**: 2026-01-20
**Goal**: A powerful, bulk GitHub management tool for repositories, issues, pull requests, and organization members.

---

## Priority 1: Critical Test Coverage (CRITICAL GAPS)

### P0: Missing Core Library Tests
- [x] **PR Operations Tests** (`src/lib/github/prs.test.ts`):
  - `normalizePullRequest()` - Test all field mappings, edge cases (missing repo, null milestones)
  - `fetchPRsAcrossRepos()` - Test pagination, filtering (state=merged vs closed), error handling
  - `executePRAction()` - Test all 9 action types (merge, close, reopen, labels, assignees, reviewers)
  - Mock `fetchWithBackoff` responses
  - **Status**: COMPLETED - 47 tests covering all PR operations
  - **Impact**: PR bulk operations are completely untested - HIGH RISK → RESOLVED

- [x] **Member Operations Tests** (`src/lib/github/members.test.ts`):
  - `fetchOrgMembers()` - Test role detection (admin vs member), pagination
  - `fetchOrgInvitations()` - Test invitation parsing, team counts
  - `removeOrgMember()` - Test success and error cases
  - `updateOrgMemberRole()` - Test role updates
  - **Status**: COMPLETED - 25 tests covering all member operations
  - **Impact**: Member management operations are completely untested - HIGH RISK → RESOLVED

- [ ] **PR Bulk Actions Hook Tests** (`src/hooks/useBulkPRActions.test.tsx`):
  - Test `executeAction()` with batch processing (BATCH_SIZE=5)
  - Test `cancelOperation()` aborts correctly
  - Test `retryFailed()` filters and retries only failed items
  - Test state transitions (isExecuting, processed, succeeded, failed)
  - **Impact**: Complex stateful hook - HIGH RISK

- [ ] **Audit Logging Tests** (`src/lib/audit.test.ts`):
  - Test successful log writes to database
  - Test error handling (should not throw)
  - Test all required fields are captured
  - **Impact**: Compliance and security feature - MEDIUM RISK

### P1: Component Test Coverage
- [ ] **Members UI Components**:
  - `InviteModal.test.tsx` - Test role selection, form validation, API calls
  - `MembersPageClient.test.tsx` - Test member/invitation tabs, bulk actions
  - Test loading states, error handling, empty states

- [ ] **Enhanced Component Tests**:
  - `OrganizationSelector.test.tsx` - Expand beyond localStorage (test fetching, error handling)
  - `RepositoriesPage.test.tsx` - Add comprehensive integration tests

---

## Priority 2: API Resilience Enhancements

### P2: Backoff Implementation Improvements
**Current Status**: Basic implementation exists but has gaps

- [ ] **Add Jitter to Backoff** (`src/lib/github/client.ts:98`):
  - Add random jitter to exponential backoff: `1000 * Math.pow(2, attempt) + random(0, 1000)`
  - Prevents thundering herd when multiple requests hit rate limit simultaneously
  - Test jitter doesn't violate minimum wait times

- [ ] **Add Max Wait Cap** (`src/lib/github/client.ts:98-114`):
  - Cap wait time to 60 seconds maximum
  - Prevents indefinite hangs when X-RateLimit-Reset is far in future
  - Log when capping occurs

- [ ] **Retry 5xx Errors** (`src/lib/github/client.ts:83-129`):
  - Add retry logic for 500, 502, 503, 504 status codes
  - Use exponential backoff for server errors (different from rate limit handling)
  - Add `isRetryableError()` helper function

- [ ] **Add Monitoring Metrics**:
  - Log rate limit events with context (endpoint, attempt count, wait time)
  - Expose metrics for dashboard (rate limit hits per hour, avg wait time)

---

## Priority 3: End-to-End Testing

### P3: E2E Test Setup
- [ ] **Install & Configure Playwright**:
  - Add `@playwright/test` to devDependencies
  - Create `playwright.config.ts` with baseURL, browser settings
  - Add test scripts to package.json

- [ ] **Critical User Flows**:
  - Bulk delete repositories (with confirmation modal)
  - Bulk close issues (with progress tracking)
  - Bulk merge PRs (with merge method selection)
  - Member role update flow
  - Filter preset creation and application

- [ ] **Error Scenario Flows**:
  - Rate limit handling (mock rate limit response)
  - Network error recovery
  - OAuth failure handling

---

## Priority 4: Future / Nice-to-Have

### P4: Feature Enhancements
- [ ] **Bulk Member Invites**:
  - Support CSV upload for multiple invites
  - Support text list (one email/username per line)
  - Bulk role assignment
  - Invitation tracking dashboard

- [ ] **Enhanced Filter Presets**:
  - Share presets with team members
  - Preset templates (common queries)
  - Auto-save frequently used filters

- [ ] **Audit Log Enhancements**:
  - Export audit log (CSV, JSON)
  - Advanced filtering by date range, action type, user
  - Audit log retention policies

- [ ] **Dashboard Analytics**:
  - Repository activity heatmap
  - PR merge velocity
  - Issue resolution time trends

---

## Completed Features

### Core Features
- **Bulk Pull Request Management**:
  - View, Filter (State, Draft, Label, Author), and Sort
  - Bulk Merge (Merge, Squash, Rebase) with custom commit messages
  - Bulk Close/Reopen
  - Bulk Label (Add/Remove/Set) and Assignee/Reviewer management
  - `PRBulkActionBar` and `PRMergeModal`

- **Bulk Repository Management**:
  - View, Filter (Visibility, Language, Archived), and Sort
  - Bulk Visibility Change (Public/Private)
  - Bulk Delete (Safe with confirmation)
  - Bulk Archive/Unarchive
  - Archive Candidates suggestion

- **Bulk Issue Management**:
  - View, Filter, and Sort
  - Bulk Close/Reopen
  - Bulk Label and Assignee management

- **Member Management**:
  - View Members and Pending Invitations
  - Single Invite with Role
  - Bulk Remove Members
  - Bulk Role Updates (Admin/Member)

### Platform & UI
- **Theme Engine**:
  - `ThemeProvider` and Light/Dark mode support
  - Theme Selector in User Preferences

- **Settings & Configuration**:
  - Account Profile, Connections, and Permissions views
  - `security` tab with Audit Log
  - Placeholders for `billing` and `notifications`

- **Safety & Operations**:
  - **Audit Log**: `audit_logs` table, `logAudit` utility, and UI view
  - **Bulk Operation UI**: `BulkOperationModal` with progress tracking and partial failure reporting
  - **Filter Presets**: Database-backed presets for Repos, Issues, and PRs
  - **Retry Logic**: "Retry Failed" button in `BulkOperationModal` with `retryFailed` function

### API Infrastructure (Partially Complete)
- **GitHub API Client** (`src/lib/github/client.ts`):
  - `fetchWithBackoff()` with basic rate limit handling
  - X-RateLimit-Reset respect
  - Retry-After header respect
  - Exponential backoff (1000 * 2^attempt)
  - Max 3 retries
  - **Gaps**: No jitter, no max wait cap, no 5xx retry

### Well-Tested Areas (8-9/10 quality)
- `src/lib/github/client.test.ts` - Header creation, rate limit parsing, backoff detection
- `src/lib/github/errors.test.ts` - Error classification
- `src/lib/github/normalize.test.ts` - Data normalization
- `src/lib/github/account.test.ts` - Account operations
- `src/lib/github/issue-operations.test.ts` - Issue bulk operations
- `src/lib/github/repos.test.ts` - Repository operations
- `src/lib/github/pagination.test.ts` - Pagination utilities
- `src/lib/github/prs.test.ts` - PR operations (NEW - 47 tests)
- `src/lib/github/members.test.ts` - Member operations (NEW - 25 tests)
- `src/hooks/useBulkRepoActions.test.tsx` - Repository bulk actions hook

---

## Summary of Changes from Previous Plan

### What Changed:
1. **Moved "API Resilience" from P3 to P2** - The basic implementation exists but needs enhancements (jitter, max cap, 5xx retry). It's not "missing" but incomplete.

2. **Reorganized testing into Priority 1 (CRITICAL GAPS)**:
   - Created **P0** for the most critical missing tests (prs.ts, members.ts, useBulkPRActions.ts, audit.ts)
   - Created **P1** for component test coverage gaps
   - Moved existing E2E tests to **P3** with detailed setup requirements

3. **Added Specific File Paths** - Every task now specifies the exact file to create or modify (e.g., `src/lib/github/prs.test.ts`)

4. **Added Test Coverage Details** - Each test task lists specific functions to test and scenarios to cover

5. **Created "Well-Tested Areas" Section** - Documents what tests ARE working well (8-9/10 quality) to show what's done right

6. **Enhanced "API Infrastructure" Section** - Clarified that `fetchWithBackoff` exists but has documented gaps

7. **Prioritized by Actual Risk** - Tasks ordered by:
   - P0: Critical untested code paths (bulk operations)
   - P1: Important untested components
   - P2: Production reliability (backoff gaps)
   - P3: Integration testing (E2E)
   - P4: Feature enhancements

8. **Added Impact Notes** - Each P0/P1 task includes risk/reasoning (e.g., "HIGH RISK - PR operations completely untested")
