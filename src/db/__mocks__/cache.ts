// src/db/__mocks__/cache.ts
import { db } from "@/db";

export const getCached = async <T>(
  userId: string,
  key: string
): Promise<any | null> => {
  // Return a mocked cached value
  return {
    data: { mocked: true },
    isStale: false,
    timestamp: new Date(),
    ttlMinutes: 60,
  };
};

export const setCache = async <T>(
  userId: string,
  key: string,
  type: string,
  data: T,
  options?: { ttlMinutes: number }
): Promise<void> => {
  // Do nothing or log for testing purposes
};