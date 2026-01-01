# Plan: Dashboard Functionality & UI Polish

## Phase 1: Backend API for Repository Actions
- [x] Task: Implement API route for visibility toggling (`PATCH /api/github/repos/visibility`) [71c7b63]
    - [x] Task: Write Tests: Verify visibility update with GitHub API mock [71c7b63]
    - [x] Task: Implement Feature: PATCH handler using octokit or fetch [71c7b63]
    - [ ] Task: Implement Feature: PATCH handler using octokit or fetch
- [x] Task: Implement API route for archiving (`PATCH /api/github/repos/archive`) [9d4c5a3]
    - [x] Task: Write Tests: Verify archiving logic [9d4c5a3]
    - [x] Task: Implement Feature: PATCH handler for archiving [9d4c5a3]
- [ ] Task: Implement API route for deletion (`DELETE /api/github/repos`)
    - [ ] Task: Write Tests: Verify deletion logic
    - [ ] Task: Implement Feature: DELETE handler
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend API for Repository Actions' (Protocol in workflow.md)

## Phase 2: UI Safety & Feedback Components
- [ ] Task: Set up toast notification system (e.g., Sonner or ShadCN Toast)
    - [ ] Task: Implement Feature: Add toast provider and helper hook
- [ ] Task: Create Confirmation Modals for destructive actions
    - [ ] Task: Write Tests: Verify modal appears and blocks action until confirmed
    - [ ] Task: Implement Feature: General-purpose confirmation modal for Archive and Delete
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Safety & Feedback Components' (Protocol in workflow.md)

## Phase 3: Dashboard Integration & Bulk Logic
- [ ] Task: Update `RepositoriesPage` to handle bulk action requests
    - [ ] Task: Write Tests: Verify state updates correctly during/after bulk actions
    - [ ] Task: Implement Feature: Connect UI buttons to new API routes with loading states
- [ ] Task: Implement optimistic UI updates or smart re-fetching
    - [ ] Task: Implement Feature: Refresh repo list after successful bulk action
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dashboard Integration & Bulk Logic' (Protocol in workflow.md)

## Phase 4: Visual Polish & Finishing Touches
- [ ] Task: Refine Repository Table UI (Spacing, Typography, Row States)
- [ ] Task: Final audit against `product-guidelines.md`
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Visual Polish & Finishing Touches' (Protocol in workflow.md)
