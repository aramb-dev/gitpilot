import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGitHubHeaders } from "@/lib/github/client";
import { detectAllOrgStatuses } from "@/lib/github/org-status";
import type { ApiResponse } from "@/types/api-errors";
import type { OrganizationAccess } from "@/types/account";

/**
 * GET /api/github/orgs/status
 * Fetches all user's organizations with their access status.
 */
export async function GET() {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
  }) | null;

  if (!session?.accessToken) {
    const response: ApiResponse<OrganizationAccess[]> = {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated. Please sign in.',
      },
    };
    return NextResponse.json(response, { status: 401 });
  }

  const headers = createGitHubHeaders(session.accessToken);

  try {
    // Fetch user's organizations
    const orgsResponse = await fetch('https://api.github.com/user/orgs?per_page=100', {
      headers,
      cache: 'no-store',
    });

    if (!orgsResponse.ok) {
      if (orgsResponse.status === 401) {
        const response: ApiResponse<OrganizationAccess[]> = {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Your GitHub access has been revoked. Please sign in again.',
          },
        };
        return NextResponse.json(response, { status: 401 });
      }

      const response: ApiResponse<OrganizationAccess[]> = {
        error: {
          code: 'NETWORK_ERROR',
          message: `GitHub API error: ${orgsResponse.status}`,
        },
      };
      return NextResponse.json(response, { status: 502 });
    }

    const orgsData = await orgsResponse.json();

    // Map to the format expected by detectAllOrgStatuses
    const orgs = orgsData.map((org: any) => ({
      id: org.id,
      login: org.login,
      avatar_url: org.avatar_url,
      description: org.description,
    }));

    // Detect access status for each org
    const orgStatuses = await detectAllOrgStatuses(session.accessToken, orgs);

    const response: ApiResponse<OrganizationAccess[]> = {
      data: orgStatuses,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<OrganizationAccess[]> = {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch organization statuses',
      },
    };
    return NextResponse.json(response, { status: 502 });
  }
}
