import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getCached, setCache } from "@/db/cache";

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
    const state = searchParams.get('state') || 'open';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const draft = searchParams.get('draft');
    const sort = searchParams.get('sort') || 'updated';
    const direction = searchParams.get('direction') || 'desc';

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

    // Fetch PRs for each repo
    const allPRs = [];
    const warnings: string[] = [];

    for (const repo of repos) {
      try {
        const query = new URLSearchParams({
          state,
          sort,
          direction,
          per_page: String(perPage * 2), // Fetch more to account for filtering
        });

        if (draft === 'true') {
          query.append('draft', 'true');
        } else if (draft === 'false') {
          query.append('draft', 'false');
        }

        const response = await fetch(
          `https://api.github.com/repos/${repo}/pulls?${query}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            warnings.push(`Repository not found: ${repo}`);
          } else if (response.status === 403) {
            warnings.push(`Access denied to repository: ${repo}`);
          }
          continue;
        }

        const prs = await response.json();
        allPRs.push(
          ...prs.map((pr: any) => ({
            id: pr.id,
            nodeId: pr.node_id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            state: pr.state,
            merged: pr.merged,
            draft: pr.draft,
            locked: pr.locked,
            user: {
              id: pr.user.id,
              login: pr.user.login,
              avatarUrl: pr.user.avatar_url,
              htmlUrl: pr.user.html_url,
            },
            assignees: pr.assignees.map((a: any) => ({
              id: a.id,
              login: a.login,
              avatarUrl: a.avatar_url,
              htmlUrl: a.html_url,
            })),
            reviewers: pr.requested_reviewers?.map((r: any) => ({
              id: r.id,
              login: r.login,
              avatarUrl: r.avatar_url,
              htmlUrl: r.html_url,
              state: 'PENDING',
            })) || [],
            labels: pr.labels.map((l: any) => ({
              id: l.id,
              name: l.name,
              color: l.color,
              description: l.description,
            })),
            milestone: pr.milestone
              ? {
                  id: pr.milestone.id,
                  number: pr.milestone.number,
                  title: pr.milestone.title,
                  state: pr.milestone.state,
                  dueOn: pr.milestone.due_on,
                }
              : null,
            repository: {
              id: pr.head.repo?.id || 0,
              name: repo.split('/')[1],
              fullName: repo,
              owner: repo.split('/')[0],
              private: pr.head.repo?.private || false,
            },
            comments: pr.comments,
            reviewComments: pr.review_comments,
            commits: pr.commits,
            additions: pr.additions,
            deletions: pr.deletions,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            closedAt: pr.closed_at,
            mergedAt: pr.merged_at,
            baseRef: pr.base.ref,
            headRef: pr.head.ref,
            htmlUrl: pr.html_url,
            apiUrl: pr.url,
          }))
        );
      } catch (error) {
        warnings.push(`Error fetching PRs from ${repo}`);
      }
    }

    // Sort and paginate
    const sorted = allPRs.sort((a: any, b: any) => {
      const aDate = new Date(a.updatedAt).getTime();
      const bDate = new Date(b.updatedAt).getTime();
      return direction === 'desc' ? bDate - aDate : aDate - bDate;
    });

    const start = (page - 1) * perPage;
    const paginatedPRs = sorted.slice(start, start + perPage);

    const responseData = {
      pullRequests: paginatedPRs,
      totalCount: sorted.length,
      hasNextPage: start + perPage < sorted.length,
    };

    // Set cache
    await setCache(userId, cacheKey, "pulls", responseData, {
      ttlMinutes: 2,
    });

    return NextResponse.json(
      {
        data: responseData,
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
