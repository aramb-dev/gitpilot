import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserPreferences, updateUserPreferences } from '@/db/preferences';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  }

  const preferences = await getUserPreferences(userId);
  return NextResponse.json(preferences);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  }

  try {
    const updates = await req.json();
    const preferences = await updateUserPreferences(userId, updates);
    return NextResponse.json(preferences);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
