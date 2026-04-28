import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeAccount } from '@/lib/github/account';
import { createGitHubHeaders } from '@/lib/github/client';
import type { Account } from '@/types/account';
import type { ApiResponse } from '@/types/api-errors';

/**
 * GET /api/auth/account
 * Fetches the full GitHub user profile for the authenticated user.
 */
export async function GET() {
  const session = (await getServerSession(authOptions)) as
    | (Session & {
        accessToken?: string;
      })
    | null;

  if (!session?.accessToken) {
    const response: ApiResponse<Account> = {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated. Please sign in.',
      },
    };
    return NextResponse.json(response, { status: 401 });
  }

  const headers = createGitHubHeaders(session.accessToken);

  try {
    const response = await fetch('https://api.github.com/user', {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        const apiResponse: ApiResponse<Account> = {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Your GitHub access has been revoked. Please sign in again.',
          },
        };
        return NextResponse.json(apiResponse, { status: 401 });
      }

      const apiResponse: ApiResponse<Account> = {
        error: {
          code: 'NETWORK_ERROR',
          message: `GitHub API error: ${response.status}`,
        },
      };
      return NextResponse.json(apiResponse, { status: 502 });
    }

    const userData = await response.json();
    const account = normalizeAccount(userData);

    const apiResponse: ApiResponse<Account> = {
      data: account,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    const apiResponse: ApiResponse<Account> = {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch account',
      },
    };
    return NextResponse.json(apiResponse, { status: 502 });
  }
}
