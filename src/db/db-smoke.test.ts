import { expect, test, describe } from "bun:test";
import { getUserPreferences, updateUserPreferences, deleteUserPreferences } from "./preferences";
import { setCache, getCached, invalidateCache } from "./cache";
import { createFilterPreset, getFilterPresets, deleteFilterPreset } from "./filter-presets";

// Note: These tests require a real database connection (DATABASE_URL)
// and will modify data for a test user. Use with caution.
const TEST_USER_ID = "test_user_smoke_test";

describe("Database Services Smoke Test", () => {
  test("User Preferences: CRUD", async () => {
    // 1. Get default
    const prefs = await getUserPreferences(TEST_USER_ID);
    expect(prefs.userId).toBe(TEST_USER_ID);
    expect(prefs.theme).toBe("dark");

    // 2. Update
    await updateUserPreferences(TEST_USER_ID, { theme: "light", itemsPerPage: 50 });
    const updated = await getUserPreferences(TEST_USER_ID);
    expect(updated.theme).toBe("light");
    expect(updated.itemsPerPage).toBe(50);

    // 3. Cleanup
    await deleteUserPreferences(TEST_USER_ID);
  });

  test("GitHub Cache: Set/Get/Invalidate", async () => {
    const cacheKey = "test_cache_key";
    const cacheData = { foo: "bar" };

    // 1. Set
    await setCache(TEST_USER_ID, cacheKey, "repositories", cacheData, { ttlMinutes: 1 });

    // 2. Get
    const cached = await getCached<typeof cacheData>(TEST_USER_ID, cacheKey);
    expect(cached).not.toBeNull();
    expect(cached?.data.foo).toBe("bar");
    expect(cached?.isStale).toBe(false);

    // 3. Invalidate
    await invalidateCache(TEST_USER_ID, cacheKey);
    const afterInvalidate = await getCached(TEST_USER_ID, cacheKey);
    expect(afterInvalidate).toBeNull();
  });

  test("Filter Presets: CRUD", async () => {
    const presetName = "Test Preset";
    const filters = { state: "open" as const, search: "test" };

    // 1. Create
    const preset = await createFilterPreset(TEST_USER_ID, presetName, filters);
    expect(preset.name).toBe(presetName);
    expect(preset.userId).toBe(TEST_USER_ID);

    // 2. List
    const allPresets = await getFilterPresets(TEST_USER_ID);
    expect(allPresets.some(p => p.id === preset.id)).toBe(true);

    // 3. Delete
    await deleteFilterPreset(preset.id, TEST_USER_ID);
    const afterDelete = await getFilterPresets(TEST_USER_ID);
    expect(afterDelete.some(p => p.id === preset.id)).toBe(false);
  });
});
