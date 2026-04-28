import { type NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { fetchOrgInvitations, fetchOrgMembers } from '@/lib/github/members';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const org = searchParams.get('org');
    const userId = (session.user as any)?.id ?? 'anonymous';

    if (!org) {
      return NextResponse.json({ error: { message: 'Organization is required' } }, { status: 400 });
    }

    const [members, invitations] = await Promise.all([
      fetchOrgMembers(session.accessToken, org, { userId }),
      fetchOrgInvitations(session.accessToken, org, userId).catch(() => []), // Might fail if user is not an admin
    ]);

    return NextResponse.json(
      {
        members,
        invitations,
      },
      { status: 200 },
    );
  } catch (_error) {
    return NextResponse.json({ error: { message: 'Failed to fetch members' } }, { status: 500 });
  }
}
