# Spec: Consolidate Dashboard, Auth, and Settings

## Overview
This track focuses on making the GitPilot dashboard fully functional. This includes stabilizing the GitHub authentication flow, allowing users to select which organizations they want to manage, and implementing powerful search and filtering on the repositories list.

## Goals
- Stable and secure GitHub OAuth integration.
- Ability to filter repositories by organization.
- Real-time search by repository name.
- Persistent user settings for organization selection.

## User Stories
- **Auth**: "As a user, I want to sign in with GitHub so I can safely access my repositories."
- **Settings**: "As a user, I want to select which organizations I am interested in so I don't clutter my dashboard with irrelevant repos."
- **Dashboard**: "As a user, I want to search and filter my repositories so I can find exactly what I need to manage in bulk."

## Technical Constraints
- **GitHub API**: All repository data must be fetched using the user's OAuth token.
- **NextAuth**: Use NextAuth.js for session management.
- **State Management**: Use React state or Zustand (as indicated in README) for filtering and search results.
- **Performance**: Ensure the UI remains responsive even with hundreds of repositories.

## Acceptance Criteria
- User can successfully login/logout via GitHub.
- Settings page lists all organizations the user belongs to.
- User can toggle organizations on/off in Settings.
- Dashboard only displays repositories from selected organizations.
- Search bar correctly filters the repository list in real-time.
- Visibility (Public/Private) and Language filters work correctly.
