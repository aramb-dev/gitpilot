/**
 * Organization Member types for GitPilot.
 */

export interface OrganizationMember {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  role: 'admin' | 'member' | 'billing_manager' | 'owner';
  status: 'active' | 'pending' | 'invited';
  twoFactorEnabled?: boolean;
  teams?: string[];
  joinedAt?: string;
}

export interface MemberInvitation {
  id: number;
  login: string | null;
  email: string | null;
  role: 'admin' | 'direct_member' | 'billing_manager';
  createdAt: string;
  inviter: {
    login: string;
    avatarUrl: string;
  };
  teamCount: number;
  invitationUrl?: string;
}

export interface MemberFilters {
  org: string;
  role?: 'all' | 'admin' | 'member';
  status?: 'all' | 'active' | 'pending';
  team?: string;
  search?: string;
}

export interface BulkMemberAction {
  org: string;
  members: string[]; // logins
  action: 'remove' | 'update_role' | 'invite' | 'cancel_invite';
  role?: 'admin' | 'member';
}
