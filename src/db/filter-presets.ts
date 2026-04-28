import { and, eq } from 'drizzle-orm';
import type { IssueFilters } from '@/types/issue';
import type { PRFilters } from '@/types/pull-request';
import { db } from './index';
import { filterPresets } from './schema';

export type PresetContext = 'repositories' | 'issues' | 'pull_requests';

export interface RepoFilters {
  visibility?: 'all' | 'public' | 'private' | 'forks';
  language?: string;
  topics?: string[];
  hasIssues?: boolean;
  hasProjects?: boolean;
  isArchived?: boolean;
  isFork?: boolean;
  sortBy?: 'name' | 'updated' | 'stars' | 'created';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export type FilterConfig = RepoFilters | IssueFilters | PRFilters;

export interface FilterPreset {
  id: string;
  userId: string;
  name: string;
  context: PresetContext;
  filters: FilterConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getFilterPresets(
  userId: string,
  context?: PresetContext,
): Promise<FilterPreset[]> {
  try {
    const conditions = [eq(filterPresets.userId, userId)];
    if (context) {
      conditions.push(eq(filterPresets.context, context));
    }

    const result = await db
      .select()
      .from(filterPresets)
      .where(and(...conditions));

    return result.map((preset) => ({
      id: preset.id,
      userId: preset.userId,
      name: preset.name,
      context: preset.context as PresetContext,
      filters: preset.filters as FilterConfig,
      isDefault: preset.isDefault,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    }));
  } catch (_error) {
    return [];
  }
}

export async function getDefaultFilterPreset(
  userId: string,
  context: PresetContext,
): Promise<FilterPreset | null> {
  try {
    const result = await db
      .select()
      .from(filterPresets)
      .where(
        and(
          eq(filterPresets.userId, userId),
          eq(filterPresets.context, context),
          eq(filterPresets.isDefault, true),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const preset = result[0];
    return {
      id: preset.id,
      userId: preset.userId,
      name: preset.name,
      context: preset.context as PresetContext,
      filters: preset.filters as FilterConfig,
      isDefault: preset.isDefault,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    };
  } catch (_error) {
    return null;
  }
}

export async function createFilterPreset(
  userId: string,
  name: string,
  context: PresetContext,
  filters: FilterConfig,
  isDefault: boolean = false,
): Promise<FilterPreset> {
  const now = new Date();
  const id = generatePresetId();
  if (isDefault) {
    await db
      .update(filterPresets)
      .set({ isDefault: false, updatedAt: now })
      .where(
        and(
          eq(filterPresets.userId, userId),
          eq(filterPresets.context, context),
          eq(filterPresets.isDefault, true),
        ),
      );
  }

  await db.insert(filterPresets).values({
    id,
    userId,
    name,
    context,
    filters,
    isDefault,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    userId,
    name,
    context,
    filters,
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateFilterPreset(
  id: string,
  userId: string,
  updates: Partial<Pick<FilterPreset, 'name' | 'filters' | 'isDefault' | 'context'>>,
): Promise<FilterPreset | null> {
  const now = new Date();
  // If setting a new default, unset existing default for THAT context
  if (updates.isDefault) {
    const current = await db.select().from(filterPresets).where(eq(filterPresets.id, id)).limit(1);

    const context = updates.context || (current[0]?.context as PresetContext);

    if (context) {
      await db
        .update(filterPresets)
        .set({ isDefault: false, updatedAt: now })
        .where(
          and(
            eq(filterPresets.userId, userId),
            eq(filterPresets.context, context),
            eq(filterPresets.isDefault, true),
          ),
        );
    }
  }

  await db
    .update(filterPresets)
    .set({ ...updates, updatedAt: now })
    .where(and(eq(filterPresets.id, id), eq(filterPresets.userId, userId)));

  const result = await db.select().from(filterPresets).where(eq(filterPresets.id, id)).limit(1);

  if (result.length === 0) {
    return null;
  }

  const preset = result[0];
  return {
    id: preset.id,
    userId: preset.userId,
    name: preset.name,
    context: preset.context as PresetContext,
    filters: preset.filters as FilterConfig,
    isDefault: preset.isDefault,
    createdAt: preset.createdAt,
    updatedAt: preset.updatedAt,
  };
}

export async function deleteFilterPreset(id: string, userId: string): Promise<void> {
  await db
    .delete(filterPresets)
    .where(and(eq(filterPresets.id, id), eq(filterPresets.userId, userId)));
}
