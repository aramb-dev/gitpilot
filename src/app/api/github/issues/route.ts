import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { fetchMultiRepoIssues } from '@/lib/github/issues';
import type { IssueFilters } from '@/types/issue';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse repos parameter (comma-separated)
    const reposParam = searchParams.get('repos');
    const repos = reposParam ? reposParam.split(',').filter(Boolean) : [];

    if (repos.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'No repositories specified' } },
        { status: 400 }
      );
    }

    // Parse filters
    const filters: IssueFilters = {};

    const state = searchParams.get('state');
    if (state === 'open' || state === 'closed' || state === 'all') {
      filters.state = state;
    }

    const labels = searchParams.get('labels');
    if (labels) {
      filters.labels = labels.split(',').filter(Boolean);
    }

    const assignee = searchParams.get('assignee');
    if (assignee) {
      filters.assignee = assignee;
    }

    const creator = searchParams.get('creator');
    if (creator) {
      filters.creator = creator;
    }

    const since = searchParams.get('since');
    if (since) {
      filters.since = since;
    }

    const sort = searchParams.get('sort');
    if (sort === 'created' || sort === 'updated' || sort === 'comments') {
      filters.sort = sort;
    }

    const direction = searchParams.get('direction');
    if (direction === 'asc' || direction === 'desc') {
      filters.direction = direction;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '30', 10);

    const result = await fetchMultiRepoIssues(
      session.accessToken,
      repos,
      filters,
      page,
      Math.min(perPage, 100)
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Issues API error:', error);

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'GitHub token is invalid' } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch issues',
        },
      },
      { status: 502 }
    );
  }
}
