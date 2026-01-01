# Spec: Dashboard Functionality & UI Polish

## Overview
This track focuses on transforming the dashboard from a read-only state to a fully functional command center. We will implement the backend logic and frontend integration for bulk repository actions (Visibility, Archive, Delete) that are currently stubbed. Additionally, we will enhance the user experience with proper feedback loops (toasts), safety mechanisms (confirmation modals), and visual polish.

## Functional Requirements

### 1. Repository Actions
- **Toggle Visibility**: Implement functionality to change selected repositories from Public to Private and vice versa.
- **Archive Repositories**: Implement functionality to archive selected repositories.
- **Delete Repositories**: Implement functionality to permanently delete selected repositories.
- **Bulk Operations**: Ensure all actions support processing multiple selected repositories simultaneously.

### 2. API Integration
- Create or update Next.js API routes (`src/app/api/github/...`) to handle these requests using the user's OAuth token.
- Handle GitHub API rate limits and errors gracefully.

## UI/UX Requirements

### 1. Feedback & Notifications
- **Toast Notifications**: Use a toast component (e.g., ShadCN `sonner` or `toast`) to display success and error messages after actions complete.
    - Success: "Successfully archived 3 repositories."
    - Error: "Failed to update visibility for 'repo-name'."

### 2. Safety & Confirmation
- **Destructive Actions**: Implement a confirmation modal for **Archive** and **Delete** actions.
    - The modal must state exactly how many repositories will be affected.
    - For deletion, require an explicit confirmation (e.g., typing "delete" or a strong "Yes, delete" button).

### 3. Loading States
- Display loading indicators (spinners or disabled states) on action buttons while requests are in flight.
- Ensure the user cannot trigger conflicting actions while an operation is pending.

### 4. Visual Polish
- Refine the `RepositoryTable` and `RepositoryActions` components to align with the project's visual design principles (spacing, colors, typography).

## Acceptance Criteria
- [ ] User can select multiple repositories and toggle their visibility.
- [ ] User can select multiple repositories and archive them after confirming in a modal.
- [ ] User can select multiple repositories and delete them after confirming in a strict modal.
- [ ] Success/Error toasts appear appropriately for all actions.
- [ ] UI reflects the new state of repositories immediately after a successful action (optimistic UI or re-fetch).
