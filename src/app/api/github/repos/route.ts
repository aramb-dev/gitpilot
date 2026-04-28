import { type NextRequest, NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGitHubHeaders, fetchWithBackoff } from '@/lib/github/client';
import { ERROR_MESSAGES } from '@/lib/github/errors';
import { getCachedRepos } from '@/lib/github/repos-service';
import type { ApiResponse } from '@/types/api-errors';
import type { Repository } from '@/types/repository';

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as
    | (Session & {
        accessToken?: string;
        user?: { id?: string };
      })
    | null;

  if (!session?.accessToken) {
    const response: ApiResponse<Repository[]> = {
      error: {
        code: 'UNAUTHORIZED',
        message: ERROR_MESSAGES.UNAUTHORIZED,
      },
    };
    return NextResponse.json(response, { status: 401 });
  }

  const userId = session.user?.id ?? 'anonymous';
  const { searchParams } = new URL(req.url);
  const selectedOrgs = searchParams.get('orgs')?.split(',').filter(Boolean) || [];
  const skipCache = searchParams.get('refresh') === 'true';

  try {
    const result = await getCachedRepos(userId, session.accessToken, selectedOrgs, skipCache);

    const response: ApiResponse<Repository[]> = {
      data: result.data,
      ...(result.warnings.length > 0 && { warnings: result.warnings }),
      ...(result.fromCache && { meta: { fromCache: true } }),
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<Repository[]> = {
      error: {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error instanceof Error ? error.message : String(error),
      },
    };
    return NextResponse.json(response, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as
    | (Session & {
        accessToken?: string;
      })
    | null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { repos } = body;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'repos' array is required." },
        { status: 400 },
      );
    }

    const userId = (session.user as any)?.id ?? 'anonymous';
    const headers = createGitHubHeaders(session.accessToken);

    const results = await Promise.all(
      repos.map(async ({ owner, repo }: { owner: string; repo: string }) => {
        try {
          const res = await fetchWithBackoff(
            `https://api.github.com/repos/${owner}/${repo}`,
            {
              method: 'DELETE',
              headers,
              cache: 'no-store',
            },
            3,
            userId,
          );

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to delete' }));
            return {
              repo: `${owner}/${repo}`,
              status: 'error',
              error: errorData.message || 'Failed to delete repository',
            };
          }

          return {
            repo: `${owner}/${repo}`,
            status: 'success',
            data: { full_name: `${owner}/${repo}` },
          };
        } catch (error) {
          return {
            repo: `${owner}/${repo}`,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown network error',
          };
        }
      }),
    );

    const success = results.filter((r) => r.status === 'success').map((r) => r.data);
    const errors = results.filter((r) => r.status === 'error');

    if (success.length > 0) {
      await import('@/db/cache').then((m) => m.invalidateCacheByPrefix(userId, 'repos:'));
    }

    return NextResponse.json({ success, errors });
  } catch (_error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
