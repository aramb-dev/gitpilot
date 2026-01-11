import { db } from "./index";
import { filterPresets } from "./schema";
import { eq, and } from "drizzle-orm";

export interface FilterConfig {
  visibility?: "all" | "public" | "private" | "forks";
  language?: string;
  topics?: string[];
  hasIssues?: boolean;
  hasProjects?: boolean;
  isArchived?: boolean;
  isFork?: boolean;
  sortBy?: "name" | "updated" | "stars" | "created";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface FilterPreset {
  id: string;
  userId: string;
  name: string;
  filters: FilterConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getFilterPresets(userId: string): Promise<FilterPreset[]> {
  try {
    const result = await db
      .select()
      .from(filterPresets)
      .where(eq(filterPresets.userId, userId));

    return result.map((preset) => ({
      id: preset.id,
      userId: preset.userId,
      name: preset.name,
      filters: preset.filters as FilterConfig,
      isDefault: preset.isDefault,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching filter presets:", error);
    return [];
  }
}

export async function getDefaultFilterPreset(
  userId: string
): Promise<FilterPreset | null> {
  try {
    const result = await db
      .select()
      .from(filterPresets)
      .where(
        and(eq(filterPresets.userId, userId), eq(filterPresets.isDefault, true))
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
      filters: preset.filters as FilterConfig,
      isDefault: preset.isDefault,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching default filter preset:", error);
    return null;
  }
}

export async function createFilterPreset(
  userId: string,
  name: string,
  filters: FilterConfig,
  isDefault: boolean = false
): Promise<FilterPreset> {
  const now = new Date();
  const id = generatePresetId();

  try {
    if (isDefault) {
      await db
        .update(filterPresets)
        .set({ isDefault: false, updatedAt: now })
        .where(
          and(eq(filterPresets.userId, userId), eq(filterPresets.isDefault, true))
        );
    }

    await db.insert(filterPresets).values({
      id,
      userId,
      name,
      filters,
      isDefault,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      userId,
      name,
      filters,
      isDefault,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error("Error creating filter preset:", error);
    throw error;
  }
}

export async function updateFilterPreset(
  id: string,
  userId: string,
  updates: Partial<Pick<FilterPreset, "name" | "filters" | "isDefault">>
): Promise<FilterPreset | null> {
  const now = new Date();

  try {
    if (updates.isDefault) {
      await db
        .update(filterPresets)
        .set({ isDefault: false, updatedAt: now })
        .where(
          and(eq(filterPresets.userId, userId), eq(filterPresets.isDefault, true))
        );
    }

    await db
      .update(filterPresets)
      .set({ ...updates, updatedAt: now })
      .where(and(eq(filterPresets.id, id), eq(filterPresets.userId, userId)));

    const result = await db
      .select()
      .from(filterPresets)
      .where(eq(filterPresets.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const preset = result[0];
    return {
      id: preset.id,
      userId: preset.userId,
      name: preset.name,
      filters: preset.filters as FilterConfig,
      isDefault: preset.isDefault,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
    };
  } catch (error) {
    console.error("Error updating filter preset:", error);
    throw error;
  }
}

export async function deleteFilterPreset(
  id: string,
  userId: string
): Promise<void> {
  try {
    await db
      .delete(filterPresets)
      .where(and(eq(filterPresets.id, id), eq(filterPresets.userId, userId)));
  } catch (error) {
    console.error("Error deleting filter preset:", error);
    throw error;
  }
}
