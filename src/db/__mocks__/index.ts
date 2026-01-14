// src/db/__mocks__/index.ts
// This mock covers the 'db' export from src/db/index.ts
// It provides a comprehensive mock for Drizzle ORM's db object, including chained methods.
export const db = {
  select: () => ({
    from: () => ({
      where: () => {
        const query: any = {
          limit: () => query,
          orderBy: () => query,
          then: (resolve: any) => resolve([]),
        };
        return query;
      },
    }),
  }),
  insert: () => ({
    values: () => ({
      onConflictDoUpdate: () => ({
        returning: async () => [{}],
      }),
      returning: async () => [{}],
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: async () => [{}],
      }),
    }),
  }),
  delete: () => ({
    where: async () => [{}],
  }),

  // Mock specific query objects if they are accessed as db.query.something
  query: {
    cache: {
      findFirst: async () => ({
        userId: "mocked_user",
        key: "mocked_key",
        type: "mocked_type",
        value: JSON.stringify({ mocked: true }),
        timestamp: new Date(),
        ttlMinutes: 60,
      }),
      create: async () => ({}),
      delete: async () => ({}),
    },
    userPreferences: {
      findFirst: async () => ({
        userId: "mocked_user",
        theme: "dark",
        itemsPerPage: 30,
      }),
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    filterPresets: {
      findMany: async () => [],
      create: async () => ({}),
      delete: async () => ({}),
    },
  },
};