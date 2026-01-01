# Plan: Consolidate Dashboard, Auth, and Settings

## Phase 1: Robust Authentication & Session Management [checkpoint: 81d67a8]
- [x] Task: Audit and stabilize GitHub OAuth flow in `src/app/api/auth/[...nextauth]/route.ts` [c07c870]
- [x] Task: Implement session helper to securely expose the GitHub access token to client/server components [b87d569]
- [x] Task: Write Tests: Verify session creation and token exposure [60f75ae]
- [x] Task: Implement Feature: Finalize Auth flow [f6e2c0d]
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Robust Authentication & Session Management' (Protocol in workflow.md)

## Phase 2: Organization Settings & Management
- [x] Task: Create UI for organization selection in `src/app/dashboard/settings/page.tsx` [6489b0f]
- [x] Task: Write Tests: Verify fetching organizations from GitHub API [04715ce]
- [x] Task: Implement Feature: Fetch and display organizations in Settings [dd85d12]
- [ ] Task: Write Tests: Verify organization selection persistence
- [ ] Task: Implement Feature: Save user-selected organizations to local storage or DB
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Organization Settings & Management' (Protocol in workflow.md)

## Phase 3: Dashboard Consolidation (Search & Filter)
- [ ] Task: Update repository fetching logic in dashboard to respect selected organizations
- [ ] Task: Write Tests: Verify repository filtering by organization
- [ ] Task: Implement Feature: Dashboard repository list filtered by settings
- [ ] Task: Add real-time search input to the dashboard header and connect to state
- [ ] Task: Write Tests: Verify real-time search logic
- [ ] Task: Implement Feature: Search functionality
- [ ] Task: Add Visibility and Language filters to the repository table
- [ ] Task: Write Tests: Verify visibility and language filtering
- [ ] Task: Implement Feature: Advanced filtering
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dashboard Consolidation (Search & Filter)' (Protocol in workflow.md)
