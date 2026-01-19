import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { GITHUB_API_BASE, createGitHubHeaders } from "@/lib/github/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { org, invitee, role } = await request.json();

    if (!org || !invitee) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const headers = createGitHubHeaders(session.accessToken);
    const isEmail = invitee.includes('@');
    
    const body: any = { role: role || 'direct_member' };
    if (isEmail) {
      body.email = invitee;
    } else {
      // Find user ID first? GitHub API for invitations can take invitee_id or email
      // Actually, if we have a username, we might need his ID for some endpoints, 
      // but /orgs/{org}/invitations can take invitee_id.
      // Let's check if we can find the user ID.
      const userRes = await fetch(`${GITHUB_API_BASE}/users/${invitee}`, { headers });
      if (!userRes.ok) {
        return NextResponse.json({ error: { message: `User ${invitee} not found` } }, { status: 404 });
      }
      const userData = await userRes.json();
      body.invitee_id = userData.id;
    }

    const res = await fetch(`${GITHUB_API_BASE}/orgs/${org}/invitations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: { message: error.message || 'Failed to send invitation' } }, { status: res.status });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: { message: 'Failed to invite member' } },
      { status: 500 }
    );
  }
}
