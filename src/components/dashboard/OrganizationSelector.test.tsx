// @ts-nocheck
// @bun-test-dom
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OrganizationSelector } from './OrganizationSelector';

const signInMock = mock(() => {});

mock.module('next-auth/react', () => ({
  signIn: signInMock,
}));

const mockOrganizations = [
  { id: 1, login: 'octo-org', avatar_url: 'https://example.com/octo.png', description: 'Core org' },
  { id: 2, login: 'data-lab', avatar_url: 'https://example.com/data.png', description: 'Data org' },
];

const originalFetch = global.fetch;

describe('OrganizationSelector', () => {
  beforeEach(() => {
    global.fetch = mock((url: string, options?: any) => {
      if (url === '/api/github/orgs') {
        return Promise.resolve(new Response(JSON.stringify(mockOrganizations), { status: 200 }));
      }
      if (url === '/api/preferences' && (!options || options.method === 'GET')) {
        return Promise.resolve(
          new Response(JSON.stringify({ selectedOrgs: ['octo-org'] }), { status: 200 }),
        );
      }
      if (url === '/api/preferences' && options?.method === 'PATCH') {
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }) as any;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
    signInMock.mockReset();
  });

  it('loads organizations and preselects saved preferences', async () => {
    render(<OrganizationSelector />);

    expect(screen.getByText('loading_orgs...')).toBeTruthy();
    expect(await screen.findByText('octo-org')).toBeTruthy();

    const checkbox = screen.getByRole('checkbox', { name: /octo-org/i });
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('saves the selected organizations to preferences', async () => {
    render(<OrganizationSelector />);

    await screen.findByText('octo-org');
    const secondCheckbox = screen.getByRole('checkbox', { name: /data-lab/i });
    fireEvent.click(secondCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'save_selection' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/preferences',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    const calls = (global.fetch as any).mock.calls;
    const saveCall = calls.find(
      (call: any) => call[0] === '/api/preferences' && call[1]?.method === 'PATCH',
    );
    const body = JSON.parse(saveCall[1].body);
    expect(body).toEqual({ selectedOrgs: ['octo-org', 'data-lab'] });
    expect(screen.getByText('saved successfully')).toBeTruthy();
  });

  it('shows an empty state when no organizations are returned', async () => {
    global.fetch = mock((url: string, options?: any) => {
      if (url === '/api/github/orgs') {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      if (url === '/api/preferences' && (!options || options.method === 'GET')) {
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }) as any;

    render(<OrganizationSelector />);

    expect(await screen.findByText('no organizations found.')).toBeTruthy();
  });

  it('reconnects GitHub when the helper button is clicked', async () => {
    render(<OrganizationSelector />);

    await screen.findByText('octo-org');
    fireEvent.click(screen.getByRole('button', { name: /reconnect_with_github/i }));

    expect(signInMock).toHaveBeenCalledWith('github', {
      callbackUrl: '/dashboard/settings',
    });
  });
});
