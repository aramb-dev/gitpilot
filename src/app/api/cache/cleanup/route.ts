import { NextResponse } from 'next/server';
import { cleanupExpiredCache } from '@/db/cache';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deletedCount = await cleanupExpiredCache();
    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to cleanup cache' }, { status: 500 });
  }
}
