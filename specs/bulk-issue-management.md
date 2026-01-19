# Bulk Issue Management

## Job to be Done
Enable users to manage issues across many repositories at once without repetitive manual updates.

## User Outcomes
- View issues across multiple repositories in one place
- Bulk close/reopen issues with optional comments
- Bulk add/remove/set labels and assignees
- Lock/unlock issues for moderation and cleanup
- Quickly find issues by state, labels, assignees, author, and text search

## Core Activities

### View Issues
**Desired Outcome**: Users can see issues across selected repositories in a scannable format

**Capability Depths**:
- **Basic**: List issues with title, repo, state, labels, assignees, timestamps
- **Enhanced**: Filters (state, labels, assignees, author, repo), search, sorting
- **Advanced**: Saved filter presets, issue preview panel, keyboard navigation

### Bulk Issue Actions
**Desired Outcome**: Users can apply actions to many issues safely

**Capability Depths**:
- **Basic**: Bulk close/reopen issues with confirmation
- **Enhanced**: Bulk label/assignee updates, lock/unlock with reason
- **Advanced**: Partial failure reporting, retry failed items, operation history

## Technical Requirements

### Authentication
- GitHub OAuth integration via NextAuth.js
- Scopes required: `repo` (and `read:org` for org visibility)

### API Integration
- GitHub REST API for issues
- Filtered list across repos with pagination
- Rate limit handling and partial failure reporting

### User Interface
- Responsive list view with bulk selection
- Clear bulk action confirmation and feedback
- Pagination and summary counts

### Data Management
- Cache issues per repo/filter with TTL
- Store issue filter presets per user
- Track bulk operation results for audit/history

## Acceptance Criteria

### Performance
- Initial issue list load completes in <3 seconds
- Bulk actions process at least 10 issues/second
- UI remains responsive during bulk operations

### Safety
- Destructive operations require confirmation
- Partial failures are clearly reported
- Locked or permission-restricted issues are handled gracefully

### Usability
- Filters update results quickly (<500ms)
- Selected issues are clearly indicated
- Preview panel shows enough context to act without leaving

## Edge Cases

- Issues endpoint returns pull requests; PRs are filtered out
- Locked issues or missing permissions block certain actions
- Issues across mixed repo access (partial visibility)
- Rate limits during large bulk operations
