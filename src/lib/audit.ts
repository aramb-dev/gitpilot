import { db } from '@/db';
import { auditLogs } from '@/db/schema';

export async function logAudit(userId: string, action: string, resourceType: string, details: any) {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId,
      action,
      resourceType,
      details,
    });
  } catch (_error) {
    // We don't throw here to avoid failing the main operation just because logging failed
  }
}
