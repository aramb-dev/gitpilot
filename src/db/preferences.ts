import { eq } from 'drizzle-orm';
import { db } from './index';
import { userPreferences } from './schema';

export interface UserPreferences {
  userId: string;
  defaultBranch: string;
  defaultVisibility: 'all' | 'public' | 'private' | 'forks';
  itemsPerPage: number;
  theme: 'dark' | 'light' | 'system';
  showArchived: boolean;
  showForks: boolean;
  selectedOrgs: string[];
}

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  defaultBranch: 'main',
  defaultVisibility: 'all',
  itemsPerPage: 30,
  theme: 'dark',
  showArchived: false,
  showForks: true,
  selectedOrgs: [],
};

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return { userId, ...DEFAULT_PREFERENCES };
    }

    const prefs = result[0];
    return {
      userId: prefs.userId,
      defaultBranch: prefs.defaultBranch,
      defaultVisibility: prefs.defaultVisibility as UserPreferences['defaultVisibility'],
      itemsPerPage: prefs.itemsPerPage,
      theme: prefs.theme as UserPreferences['theme'],
      showArchived: prefs.showArchived,
      showForks: prefs.showForks,
      selectedOrgs: (prefs.selectedOrgs as string[]) ?? [],
    };
  } catch (_error) {
    return { userId, ...DEFAULT_PREFERENCES };
  }
}

export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'userId'>>,
): Promise<UserPreferences> {
  const now = new Date();
  await db
    .insert(userPreferences)
    .values({
      userId,
      ...DEFAULT_PREFERENCES,
      ...updates,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        ...updates,
        updatedAt: now,
      },
    });

  return getUserPreferences(userId);
}

export async function deleteUserPreferences(userId: string): Promise<void> {
  await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
}
