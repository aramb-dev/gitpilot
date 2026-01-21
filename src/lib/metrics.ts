import { db } from "@/db";
import { apiMetrics } from "@/db/schema";

export type MetricSource = 'rate_limit' | 'server_error' | 'success';

/**
 * Logs an API event to the database for monitoring.
 * 
 * @param userId - ID of the user who triggered the request
 * @param endpoint - The API endpoint being called
 * @param status - HTTP status code received
 * @param attempt - The retry attempt number (0 for first try)
 * @param waitTimeMs - Time spent waiting before this attempt/after failure
 * @param source - The cause of the metric (rate_limit, server_error, or success)
 */
export async function logApiMetric(
  userId: string,
  endpoint: string,
  status: number,
  attempt: number,
  waitTimeMs: number,
  source: MetricSource
) {
  try {
    await db.insert(apiMetrics).values({
      id: crypto.randomUUID(),
      userId,
      endpoint,
      status,
      attempt,
      waitTimeMs,
      source,
    });
  } catch (error) {
    // We don't want to fail the main operation if metrics logging fails
    console.error("Failed to log API metric:", error);
  }
}
