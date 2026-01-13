import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

interface BulkPRActionRequest {
  prs: { owner: string; repo: string; prNumber: number }[];
  action: 'merge' | 'close' | 'reopen' | 'draft' | 'ready';
  commitMessage?: string;
  mergeMethod?: 'merge' | 'squash' | 'rebase';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body: BulkPRActionRequest = await request.json();
    const { prs, action, commitMessage, mergeMethod = 'merge' } = body;

    if (!prs.length || !action) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const results = { success: [] as any[], errors: [] as any[] };

    for (const pr of prs) {
      try {
        const url = `https://api.github.com/repos/${pr.owner}/${pr.repo}/pulls/${pr.prNumber}`;

        if (action === 'merge') {
          const mergeResponse = await fetch(`${url}/merge`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              commit_message: commitMessage,
              merge_method: mergeMethod,
            }),
          });

          if (mergeResponse.ok) {
            results.success.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              action,
            });
          } else {
            const error = await mergeResponse.json();
            results.errors.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              message: error.message || 'Failed to merge PR',
            });
          }
        } else if (action === 'close' || action === 'reopen') {
          const state = action === 'close' ? 'closed' : 'open';
          const updateResponse = await fetch(url, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({ state }),
          });

          if (updateResponse.ok) {
            results.success.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              action,
            });
          } else {
            const error = await updateResponse.json();
            results.errors.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              message: error.message || `Failed to ${action} PR`,
            });
          }
        } else if (action === 'draft') {
          const draftResponse = await fetch(url, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({ draft: true }),
          });

          if (draftResponse.ok) {
            results.success.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              action,
            });
          } else {
            const error = await draftResponse.json();
            results.errors.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              message: error.message || 'Failed to mark as draft',
            });
          }
        } else if (action === 'ready') {
          const readyResponse = await fetch(url, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({ draft: false }),
          });

          if (readyResponse.ok) {
            results.success.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              action,
            });
          } else {
            const error = await readyResponse.json();
            results.errors.push({
              owner: pr.owner,
              repo: pr.repo,
              prNumber: pr.prNumber,
              message: error.message || 'Failed to mark as ready',
            });
          }
        }
      } catch (error) {
        results.errors.push({
          owner: pr.owner,
          repo: pr.repo,
          prNumber: pr.prNumber,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error processing PR actions:', error);
    return NextResponse.json(
      { error: { message: 'Failed to process PR actions' } },
      { status: 500 }
    );
  }
}
