// @ts-nocheck
// @bun-test-dom
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MembersPageClient } from './MembersPageClient';

mock.module('sonner', () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}));

mock.module('@/hooks/usePreferences', () => ({
  usePreferences: mock(() => ({
    preferences: {
      selectedOrgs: ['acme-org'],
    },
    updatePreferences: mock(() => {}),
    isLoading: false,
  })),
}));

mock.module('./InviteModal', () => ({
  InviteModal: ({ isOpen, onInvite, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="invite-modal">
        <button onClick={() => onInvite('octocat', 'admin')}>trigger_invite</button>
        <button onClick={onClose}>close_invite</button>
      </div>
    );
  },
}));

const originalFetch = global.fetch;

const membersResponse = {
  members: [
    {
      id: 1,
      login: 'alpha',
      avatarUrl: 'https://example.com/alpha.png',
      htmlUrl: 'https://github.com/alpha',
      role: 'admin',
      status: 'active',
    },
    {
      id: 2,
      login: 'beta',
      avatarUrl: 'https://example.com/beta.png',
      htmlUrl: 'https://github.com/beta',
      role: 'member',
      status: 'active',
    },
  ],
  invitations: [
    {
      id: 10,
      login: 'invitee',
      email: null,
      role: 'direct_member',
      createdAt: new Date().toISOString(),
      inviter: {
        login: 'admin',
        avatarUrl: 'https://example.com/admin.png',
      },
      teamCount: 0,
    },
  ],
};

describe('MembersPageClient', () => {
  beforeEach(() => {
    global.fetch = mock((url: string, options?: any) => {
      if (url === '/api/github/members?org=acme-org') {
        return Promise.resolve(new Response(JSON.stringify(membersResponse), { status: 200 }));
      }
      if (url === '/api/github/members/actions') {
        return Promise.resolve(
          new Response(JSON.stringify({ success: ['alpha'], errors: [] }), { status: 200 }),
        );
      }
      if (url === '/api/github/members/invite') {
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }) as any;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it('renders members and invitations from the selected org', async () => {
    render(<MembersPageClient />);

    expect(await screen.findByText('alpha')).toBeTruthy();
    expect(await screen.findByText('beta')).toBeTruthy();
    expect(await screen.findByText('invitee')).toBeTruthy();
  });

  it('filters members based on search input', async () => {
    render(<MembersPageClient />);

    await screen.findByText('alpha');
    const searchInput = screen.getByPlaceholderText(/search_members/i);
    fireEvent.change(searchInput, { target: { value: 'beta' } });

    expect(screen.queryByText('alpha')).toBeNull();
    expect(screen.getByText('beta')).toBeTruthy();
  });

  it('shows empty state when there are no invitations', async () => {
    global.fetch = mock((url: string) => {
      if (url === '/api/github/members?org=acme-org') {
        return Promise.resolve(
          new Response(JSON.stringify({ ...membersResponse, invitations: [] }), { status: 200 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }) as any;

    render(<MembersPageClient />);

    expect(await screen.findByText(/no_pending_invites/i)).toBeTruthy();
  });

  it('renders an error message when the fetch fails', async () => {
    global.fetch = mock((url: string) => {
      if (url === '/api/github/members?org=acme-org') {
        return Promise.resolve(new Response(JSON.stringify({ message: 'fail' }), { status: 500 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }) as any;

    render(<MembersPageClient />);

    expect(await screen.findByText(/failed to fetch members/i)).toBeTruthy();
  });

  it('shows loading state while fetching members', async () => {
    let resolveFetch: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch = mock(() => pendingFetch) as any;

    render(<MembersPageClient />);

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    resolveFetch!(new Response(JSON.stringify(membersResponse), { status: 200 }));
  });

  it('triggers a bulk role update action', async () => {
    render(<MembersPageClient />);

    await screen.findByText('alpha');
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByRole('button', { name: /make_admin/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/github/members/actions',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    const calls = (global.fetch as any).mock.calls;
    const actionsCall = calls.find((call: any) => call[0] === '/api/github/members/actions');
    const body = JSON.parse(actionsCall[1].body);
    expect(body).toEqual({
      org: 'acme-org',
      members: ['alpha'],
      action: 'update_role',
      role: 'admin',
    });
  });

  it('sends an invite when the invite modal triggers', async () => {
    render(<MembersPageClient />);

    await screen.findByText('alpha');
    fireEvent.click(screen.getByRole('button', { name: /^invite$/i }));

    const inviteTrigger = await screen.findByRole('button', { name: /trigger_invite/i });
    fireEvent.click(inviteTrigger);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/github/members/invite',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    const calls = (global.fetch as any).mock.calls;
    const inviteCall = calls.find((call: any) => call[0] === '/api/github/members/invite');
    const body = JSON.parse(inviteCall[1].body);
    expect(body).toEqual({
      org: 'acme-org',
      invitee: 'octocat',
      role: 'admin',
    });
  });
});
