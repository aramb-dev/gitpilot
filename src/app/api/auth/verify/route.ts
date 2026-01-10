import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { TokenVerificationResult } from "@/types/account";
import { createGitHubHeaders, parseRateLimitHeaders } from "@/lib/github/client";

/**
 * GET /api/auth/verify
 * Verifies the current session's GitHub token is still valid.
 * Returns user info, granted scopes, and rate limit status.
 */
export async function GET() {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
  }) | null;

  if (!session?.accessToken) {
    const result: TokenVerificationResult = {
      valid: false,
      error: {
        code: 'TOKEN_REVOKED',
        message: 'No access token found. Please sign in again.',
      },
    };
    return NextResponse.json(result, { status: 401 });
  }

  const headers = createGitHubHeaders(session.accessToken);

  try {
    const response = await fetch('https://api.github.com/user', {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        const result: TokenVerificationResult = {
          valid: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Your GitHub access has been revoked. Please sign in again.',
          },
        };
        return NextResponse.json(result, { status: 401 });
      }

      const result: TokenVerificationResult = {
        valid: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `GitHub API error: ${response.status}`,
        },
      };
      return NextResponse.json(result, { status: 502 });
    }

    const userData = await response.json();

    // Extract scopes from response header
    const scopesHeader = response.headers.get('X-OAuth-Scopes');
    const scopes = scopesHeader 
      ? scopesHeader.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Get rate limit info
    const rateLimitInfo = parseRateLimitHeaders(response);

    const result: TokenVerificationResult = {
      valid: true,
      user: {
        id: userData.id,
        login: userData.login,
        avatarUrl: userData.avatar_url,
      },
      scopes,
      rateLimitRemaining: rateLimitInfo?.remaining,
    };

    return NextResponse.json(result);
  } catch (error) {
    const result: TokenVerificationResult = {
      valid: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to verify token',
      },
    };
    return NextResponse.json(result, { status: 502 });
  }
}
