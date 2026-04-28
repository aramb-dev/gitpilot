import { type NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { removeOrgMember, updateOrgMemberRole } from '@/lib/github/members';
import type { BulkMemberAction } from '@/types/member';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body: BulkMemberAction = await request.json();
    const { org, members, action, role } = body;

    if (!org || !members.length || !action) {
      return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const results = { success: [] as string[], errors: [] as { login: string; message: string }[] };

    const actionPromises = members.map(async (username) => {
      let result;
      if (action === 'remove') {
        result = await removeOrgMember(accessToken, org, username);
      } else if (action === 'update_role' && role) {
        result = await updateOrgMemberRole(accessToken, org, username, role);
      } else {
        result = { success: false, error: 'Invalid action or missing role' };
      }

      if (result.success) {
        results.success.push(username);
      } else {
        results.errors.push({
          login: username,
          message: result.error || 'Operation failed',
        });
      }
    });

    await Promise.all(actionPromises);

    return NextResponse.json(results, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { error: { message: 'Failed to process member actions' } },
      { status: 500 },
    );
  }
}
