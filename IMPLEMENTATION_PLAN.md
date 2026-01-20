# GitPilot Implementation Plan

**Last Updated**: 2026-01-19
**Goal**: A powerful, bulk GitHub management tool for repositories, issues, pull requests, and organization members.

## Pending (highest priority first)

### P3: Safety & Operations
- [ ] **API Resilience**:
    - Implement intelligent backoff for API rate limits in `src/lib/github/client.ts`.

### P4: Testing & Quality
- [ ] **E2E Tests**: Add Playwright tests for critical flows (bulk delete repo, bulk close issue).
- [ ] **Unit Tests**: Increase coverage for `src/lib/github` utilities.

### Future / Nice-to-Have
- [ ] **Bulk Invites**: Support inviting multiple members via CSV or text list (currently single invite).

## Completed

### P3: Safety & Operations
- **Retry Logic**:
    - Added "Retry Failed" button to `BulkOperationModal` results view.
    - Implemented logic to re-queue failed items in `useBulk*Actions` hooks with `retryFailed` function.
    - Verified with unit tests.

### Core Features
- **Bulk Pull Request Management**:
    - View, Filter (State, Draft, Label, Author), and Sort.
    - Bulk Merge (Merge, Squash, Rebase) with custom commit messages.
    - Bulk Close/Reopen.
    - Bulk Label (Add/Remove/Set) and Assignee/Reviewer management.
    - `PRBulkActionBar` and `PRMergeModal`.
- **Bulk Repository Management**:
    - View, Filter (Visibility, Language, Archived), and Sort.
    - Bulk Visibility Change (Public/Private).
    - Bulk Delete (Safe with confirmation).
    - Bulk Archive/Unarchive.
    - Archive Candidates suggestion.
- **Bulk Issue Management**:
    - View, Filter, and Sort.
    - Bulk Close/Reopen.
    - Bulk Label and Assignee management.
- **Member Management**:
    - View Members and Pending Invitations.
    - Single Invite with Role.
    - Bulk Remove Members.
    - Bulk Role Updates (Admin/Member).

### Platform & UI
- **Theme Engine**:
    - `ThemeProvider` and Light/Dark mode support.
    - Theme Selector in User Preferences.
- **Settings & Configuration**:
    - Account Profile, Connections, and Permissions views.
    - `security` tab with Audit Log.
    - Placeholders for `billing` and `notifications`.
- **Safety & Operations**:
    - **Audit Log**: `audit_logs` table, `logAudit` utility, and UI view.
    - **Bulk Operation UI**: `BulkOperationModal` with progress tracking and partial failure reporting.
    - **Filter Presets**: Database-backed presets for Repos, Issues, and PRs.
