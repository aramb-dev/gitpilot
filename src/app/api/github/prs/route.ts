import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getCached, setCache } from "@/db/cache";
import { fetchPRsAcrossRepos } from "@/lib/github/prs";
import type { PRFilters } from "@/types/pull-request";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const repos = searchParams.get('repos')?.split(',') || [];
    const state = searchParams.get('state') as any || 'open';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const draft = searchParams.get('draft') === 'true' ? true : searchParams.get('draft') === 'false' ? false : undefined;
    const sort = searchParams.get('sort') as any || 'updated';
    const direction = searchParams.get('direction') as any || 'desc';
    const search = searchParams.get('search') || undefined;

    const userId = (session.user as any)?.id ?? "anonymous";
    const cacheKey = `prs:${repos.sort().join(",")}:${searchParams.toString()}`;
    const skipCache = searchParams.get("refresh") === "true";

    // Check cache
    if (!skipCache) {
      const cached = await getCached<any>(userId, cacheKey);
      if (cached && !cached.isStale) {
        return NextResponse.json({
          data: cached.data,
          meta: { fromCache: true }
        });
      }
    }

    if (!repos.length) {
      return NextResponse.json(
        {
          data: {
            pullRequests: [],
            totalCount: 0,
            hasNextPage: false,
          },
        },
        { status: 200 }
      );
    }

    const filters: PRFilters = {
      repos,
      state,
      draft,
      sort,
      direction,
      search,
    };

    // Cast filters to any to allow extra properties like page/perPage which are used in fetchPRsAcrossRepos
    const { data, warnings } = await fetchPRsAcrossRepos(session.accessToken, { ...filters, page, perPage } as any);

    // Set cache
    await setCache(userId, cacheKey, "pulls", data, {
      ttlMinutes: 2,
    });

    return NextResponse.json(
      {
        data,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch pull requests' } },
      { status: 500 }
    );
  }
}
