import { describe, expect, it, mock } from "bun:test";

// Since RepositoriesPage is a complex Client Component with many hooks,
// we will focus on testing the filtering logic which is currently useMemoized.
// In a real TDD flow, we might extract the filtering logic into a pure function.

function filterRepositories(repositories: any[], searchQuery: string) {
    const normalizedQuery = searchQuery.toLowerCase();
    return repositories.filter((repo) => {
        if (!normalizedQuery) return true;
        return (
            repo.name.toLowerCase().includes(normalizedQuery) ||
            repo.owner.toLowerCase().includes(normalizedQuery) ||
            repo.full_name.toLowerCase().includes(normalizedQuery)
        );
    });
}

describe("Repository Filtering Logic", () => {
  const mockRepos = [
    { id: 1, name: "gitpilot", owner: "user1", full_name: "user1/gitpilot" },
    { id: 2, name: "website", owner: "org1", full_name: "org1/website" },
    { id: 3, name: "backend", owner: "user1", full_name: "user1/backend" },
  ];

  it("should return all repos if query is empty", () => {
    expect(filterRepositories(mockRepos, "")).toHaveLength(3);
  });

  it("should filter by repository name", () => {
    const results = filterRepositories(mockRepos, "pilot");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("gitpilot");
  });

  it("should filter by owner", () => {
    const results = filterRepositories(mockRepos, "org1");
    expect(results).toHaveLength(1);
    expect(results[0].owner).toBe("org1");
  });

  it("should be case insensitive", () => {
    const results = filterRepositories(mockRepos, "BACKEND");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("backend");
  });
});
