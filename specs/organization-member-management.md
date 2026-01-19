# Organization Member Management

## Job to be Done
Enable organization owners and admins to manage members, roles, and invitations at scale.

## User Outcomes
- View organization members with roles and status
- Invite new members with roles and team assignments
- Remove members and update roles in bulk
- Manage pending invitations and cancellations
- Filter members by role, team, and status

## Core Activities

### View Members
**Desired Outcome**: Users can see all members and their roles clearly

**Capability Depths**:
- **Basic**: List members with avatar, role, and status
- **Enhanced**: Filters by role/team/status, search by username
- **Advanced**: Saved filter presets, team membership view

### Manage Invitations
**Desired Outcome**: Users can invite and manage pending members safely

**Capability Depths**:
- **Basic**: Invite members by username/email with role
- **Enhanced**: Assign teams on invite, manage pending invites
- **Advanced**: Bulk invites, bulk cancel, invitation audit trail

### Manage Roles and Membership
**Desired Outcome**: Users can update roles and remove members in bulk

**Capability Depths**:
- **Basic**: Remove members, update role one-by-one
- **Enhanced**: Bulk role changes and removals with confirmations
- **Advanced**: Retry failed operations, operation history

## Technical Requirements

### Authentication
- GitHub OAuth integration via NextAuth.js
- Scopes required: `admin:org` (or `write:org` depending on API needs)

### API Integration
- GitHub REST API for org members, invitations, and teams
- Role update endpoints and team membership endpoints
- Handle SAML SSO enforcement and OAuth app restrictions

### User Interface
- Member list with selection and bulk actions
- Invite modal with role/team selection
- Clear warnings for destructive actions

### Data Management
- Cache member lists and invitations with TTL
- Store member filter presets per user
- Track bulk operation results for audit/history

## Acceptance Criteria

### Performance
- Initial member list load completes in <3 seconds
- Bulk operations process at least 10 members/second
- UI remains responsive during bulk operations

### Safety
- Destructive operations require confirmation
- Permission errors and SSO restrictions are clearly explained
- Partial failures are clearly reported

### Usability
- Filters update results quickly (<500ms)
- Selected members are clearly indicated
- Invitations and role changes are visible immediately

## Edge Cases

- Organizations enforcing SAML SSO
- OAuth app restrictions preventing access
- Members with pending invites or suspended accounts
- Rate limits during large bulk operations
