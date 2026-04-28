import { NextResponse } from 'next/server';
import { invalidateCacheByPrefix } from '@/db/cache';
import { getAuthSession } from '@/lib/auth';
import { executeBulkAction } from '@/lib/github/issue-operations';
import type { BulkIssueAction, IssueIdentifier } from '@/types/issue';

interface BulkRequestBody {
  issues: IssueIdentifier[];
  action: BulkIssueAction;
}

function isValidAction(action: unknown): action is BulkIssueAction {
  if (!action || typeof action !== 'object') return false;
  const a = action as Record<string, unknown>;

  switch (a.type) {
    case 'close':
      return true;
    case 'reopen':
      return true;
    case 'add_labels':
    case 'remove_labels':
    case 'set_labels':
      return Array.isArray(a.labels) && a.labels.every((l) => typeof l === 'string');
    case 'assign':
    case 'unassign':
      return Array.isArray(a.assignees) && a.assignees.every((a) => typeof a === 'string');
    case 'lock':
      return true;
    case 'unlock':
      return true;
    default:
      return false;
  }
}

function isValidIssue(issue: unknown): issue is IssueIdentifier {
  if (!issue || typeof issue !== 'object') return false;
  const i = issue as Record<string, unknown>;
  return typeof i.owner === 'string' && typeof i.repo === 'string' && typeof i.number === 'number';
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const userId = session.user?.id ?? 'anonymous';
    const body: BulkRequestBody = await request.json();

    // Validate request body
    if (!body.issues || !Array.isArray(body.issues) || body.issues.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'No issues specified' } },
        { status: 400 },
      );
    }

    if (!body.issues.every(isValidIssue)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid issue format' } },
        { status: 400 },
      );
    }

    if (!isValidAction(body.action)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid action' } },
        { status: 400 },
      );
    }

    // Limit bulk operations to 100 issues at a time
    if (body.issues.length > 100) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Maximum 100 issues per request' } },
        { status: 400 },
      );
    }

    const result = await executeBulkAction(session.accessToken, body.issues, body.action);

    // Invalidate issues cache for this user
    if (result.succeeded > 0) {
      await invalidateCacheByPrefix(userId, 'issues:');
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'GitHub token is invalid' } },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to execute bulk action',
        },
      },
      { status: 502 },
    );
  }
}
