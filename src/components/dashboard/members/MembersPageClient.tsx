'use client';

import { AlertCircle, RefreshCw, Search, Shield, Trash2, UserPlus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/hooks/usePreferences';
import type { MemberInvitation, OrganizationMember } from '@/types/member';
import { InviteModal } from './InviteModal';

export function MembersPageClient() {
  const { preferences } = usePreferences();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<MemberInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Set initial org
  useEffect(() => {
    if (preferences?.selectedOrgs?.length && !selectedOrg) {
      setSelectedOrg(preferences.selectedOrgs[0]);
    }
  }, [preferences, selectedOrg]);

  const fetchData = useCallback(async (org: string) => {
    if (!org) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/members?org=${org}`);
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data.members);
      setInvitations(data.invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedOrg);
  }, [selectedOrg, fetchData]);

  const handleInvite = async (target: string, role: 'admin' | 'direct_member') => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/github/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org: selectedOrg,
          invitee: target,
          role,
        }),
      });

      if (!res.ok) throw new Error('Failed to send invitation');

      toast.success(`Invitation sent to ${target}`);
      setIsInviteModalOpen(false);
      fetchData(selectedOrg);
    } catch (err) {
      toast.error('Failed to send invitation');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAction = async (action: 'remove' | 'update_role', role?: 'admin' | 'member') => {
    if (selectedMembers.length === 0) return;

    try {
      const res = await fetch('/api/github/members/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org: selectedOrg,
          members: selectedMembers,
          action,
          role,
        }),
      });

      const data = await res.json();
      if (data.success?.length > 0) {
        toast.success(`Successfully processed ${data.success.length} members.`);
        setSelectedMembers([]);
        fetchData(selectedOrg);
      }
      if (data.errors?.length > 0) {
        toast.error(`Failed to process ${data.errors.length} members.`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filteredMembers = members.filter((m) =>
    m.login.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="bg-[#1a1a1a] border border-[#333] text-white text-sm px-3 py-2 font-mono focus:ring-[#00ff00]"
          >
            {preferences?.selectedOrgs?.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
            {!preferences?.selectedOrgs?.length && <option value="">no_orgs_selected</option>}
          </select>
          <div className="h-4 w-px bg-[#333]" />
          <h1 className="text-xl font-bold text-white tracking-tighter uppercase">Members</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#00ff00] text-black font-bold hover:bg-[#00cc00]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            INVITE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(selectedOrg)}
            className="border-[#333] text-[#666] hover:text-[#00ff00]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <input
          type="text"
          placeholder="search_members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-[#0d0d0d] border border-[#333] text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
        />
      </div>

      {/* Main Content */}
      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-[#333] bg-[#0d0d0d]">
              <div className="p-4 border-b border-[#333] bg-[#1a1a1a] flex items-center justify-between">
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-widest">
                  organization_members
                </span>
                <span className="text-[10px] text-[#666]">{filteredMembers.length} active</span>
              </div>

              <div className="divide-y divide-[#333]">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center gap-4 hover:bg-[#151515] transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.login)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedMembers([...selectedMembers, member.login]);
                        else setSelectedMembers(selectedMembers.filter((m) => m !== member.login));
                      }}
                      className="w-4 h-4 accent-[#00ff00]"
                    />
                    <img
                      src={member.avatarUrl}
                      className="w-8 h-8 rounded-none border border-[#333]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{member.login}</span>
                        {member.role === 'admin' && (
                          <Badge
                            variant="outline"
                            className="text-[9px] border-purple-500/30 text-purple-400 font-mono py-0"
                          >
                            ADMIN
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-[#666] truncate">{member.htmlUrl}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMembers([member.login]);
                          handleAction('update_role', member.role === 'admin' ? 'member' : 'admin');
                        }}
                        className="h-7 text-[10px] text-[#666] hover:text-[#00ff00]"
                      >
                        CHANGE_ROLE
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMembers([member.login]);
                          handleAction('remove');
                        }}
                        className="h-7 text-[10px] text-[#666] hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invitations & Teams Sidebar */}
          <div className="space-y-6">
            <div className="border border-[#333] bg-[#0d0d0d]">
              <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-widest">
                  Pending Invitations
                </span>
              </div>
              <div className="p-4 space-y-4">
                {invitations.length === 0 ? (
                  <p className="text-[10px] text-[#444] text-center py-4 italic">
                    no_pending_invites
                  </p>
                ) : (
                  invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="text-xs space-y-1 p-2 bg-[#151515] border border-[#333]"
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-bold">{invite.login || invite.email}</span>
                        <span className="text-[#666] text-[9px]">{invite.role}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] text-[#555]">by {invite.inviter.login}</span>
                        <button className="text-[9px] text-red-900 hover:text-red-500 uppercase font-bold">
                          cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-[#00ff00]/5 border border-[#00ff00]/10 text-[10px] text-[#666] leading-relaxed">
              <Shield className="w-4 h-4 text-[#00ff00] mb-2" />
              <p>
                &gt; only organization owners can manage member roles and invitations. permissions
                are synchronized with github.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedMembers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
          <div className="bg-[#0d0d0d] border border-[#00ff00]/30 shadow-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-[#00ff00] text-black px-2 py-0.5 text-xs font-bold">
                {selectedMembers.length}
              </span>
              <span className="text-xs text-[#00ff00] font-bold uppercase tracking-widest">
                selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction('update_role', 'admin')}
                className="border-[#333] text-[#888] hover:text-[#00ff00] text-xs h-8"
              >
                MAKE_ADMIN
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction('remove')}
                className="border-[#333] text-[#888] hover:text-red-500 text-xs h-8"
              >
                REMOVE
              </Button>
              <X
                className="w-4 h-4 text-[#444] cursor-pointer ml-2"
                onClick={() => setSelectedMembers([])}
              />
            </div>
          </div>
        </div>
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        isLoading={isActionLoading}
      />
    </div>
  );
}
