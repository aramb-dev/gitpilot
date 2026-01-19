import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { executePRAction } from "@/lib/github/prs";

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

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const results = { success: [] as any[], errors: [] as any[] };

    const actionPromises = prs.map(async (pr) => {
      const result = await executePRAction(accessToken, {
        owner: pr.owner,
        repo: pr.repo,
        number: pr.prNumber
      }, action, {
        commitMessage,
        mergeMethod
      });

      if (result.success) {
        results.success.push({
          owner: pr.owner,
          repo: pr.repo,
          prNumber: pr.prNumber,
          action,
        });
      } else {
        results.errors.push({
          owner: pr.owner,
          repo: pr.repo,
          prNumber: pr.prNumber,
          message: result.error || `Failed to ${action} PR`,
        });
      }
    });

    await Promise.all(actionPromises);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error processing PR actions:', error);
    return NextResponse.json(
      { error: { message: 'Failed to process PR actions' } },
      { status: 500 }
    );
  }
}
