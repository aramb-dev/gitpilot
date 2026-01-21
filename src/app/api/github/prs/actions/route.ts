import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { executePRAction } from "@/lib/github/prs";
import { logAudit } from "@/lib/audit";
import type { BulkPRAction } from '@/types/pull-request';

interface BulkPRActionRequest {
  prs: { owner: string; repo: string; prNumber: number }[];
  action: BulkPRAction;
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
    const { prs, action } = body;

    if (!prs.length || !action) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const accessToken = session.accessToken;
    const userId = (session.user as any)?.id ?? "anonymous";
    const results = { success: [] as any[], errors: [] as any[] };

    const actionPromises = prs.map(async (pr) => {
      const result = await executePRAction(accessToken, {
        owner: pr.owner,
        repo: pr.repo,
        number: pr.prNumber
      }, action, userId);

      if (result.success) {
        results.success.push({
          owner: pr.owner,
          repo: pr.repo,
          prNumber: pr.prNumber,
          action: action.type,
        });
      } else {
        results.errors.push({
          owner: pr.owner,
          repo: pr.repo,
          prNumber: pr.prNumber,
          message: result.error || `Failed to ${action.type} PR`,
        });
      }
    });

    await Promise.all(actionPromises);

    // Audit Log
    if (results.success.length > 0 || results.errors.length > 0) {
      await logAudit(userId, `bulk_pr_${action.type}`, "pull_request", {
        successCount: results.success.length,
        failureCount: results.errors.length,
        targets: prs.map(p => `${p.owner}/${p.repo}#${p.prNumber}`),
        actionDetails: action
      });
    }

    if (results.success.length > 0) {
      await import("@/db/cache").then(m => m.invalidateCacheByPrefix(userId, "pulls:"));
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
