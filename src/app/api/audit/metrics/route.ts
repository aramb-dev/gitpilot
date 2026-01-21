import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { apiMetrics } from '@/db/schema';
import { eq, desc, gte, and, sql } from 'drizzle-orm';

export async function GET() {
  const session = await getAuthSession();
  
  // Need to cast session because next-auth types can be tricky
  const typedSession = session as any;
  
  if (!typedSession?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = typedSession.user.id;
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);

  try {
    // Get recent hits (last hour)
    const recentHits = await db
      .select()
      .from(apiMetrics)
      .where(
        and(
          eq(apiMetrics.userId, userId),
          gte(apiMetrics.createdAt, oneHourAgo)
        )
      )
      .orderBy(desc(apiMetrics.createdAt))
      .limit(50);

    // Aggregated metrics (last hour)
    const stats = await db
      .select({
        rateLimitHits: sql<number>`count(*) filter (where source = 'rate_limit')`,
        avgWaitTime: sql<number>`avg(wait_time_ms) filter (where wait_time_ms > 0)`,
        totalEvents: sql<number>`count(*)`,
      })
      .from(apiMetrics)
      .where(
        and(
          eq(apiMetrics.userId, userId),
          gte(apiMetrics.createdAt, oneHourAgo)
        )
      );

    // Aggregated metrics (last 24 hours) for comparison
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000);
    const stats24h = await db
      .select({
        rateLimitHits: sql<number>`count(*) filter (where source = 'rate_limit')`,
        avgWaitTime: sql<number>`avg(wait_time_ms) filter (where wait_time_ms > 0)`,
        totalEvents: sql<number>`count(*)`,
      })
      .from(apiMetrics)
      .where(
        and(
          eq(apiMetrics.userId, userId),
          gte(apiMetrics.createdAt, twentyFourHoursAgo)
        )
      );

    return NextResponse.json({
      recentEvents: recentHits,
      hourStats: stats[0] || { rateLimitHits: 0, avgWaitTime: 0, totalEvents: 0 },
      dayStats: stats24h[0] || { rateLimitHits: 0, avgWaitTime: 0, totalEvents: 0 }
    });
  } catch (error) {
    console.error("Failed to fetch API metrics:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
