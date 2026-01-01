import { describe, expect, it, mock } from "bun:test";

// Since RepositoriesPage is a complex Client Component with many hooks,
// we will focus on testing the filtering logic which is currently useMemoized.
// In a real TDD flow, we might extract the filtering logic into a pure function.

function filterRepositories(repositories: any[], searchQuery: string, visibilityFilter: string = 'all', languageFilter: string = 'all') {
    const normalizedQuery = searchQuery.toLowerCase();
    return repositories.filter((repo) => {
        const matchesSearch = !normalizedQuery || (
            repo.name.toLowerCase().includes(normalizedQuery) ||
            repo.owner.toLowerCase().includes(normalizedQuery) ||
            repo.full_name.toLowerCase().includes(normalizedQuery)
        )
        const matchesVisibility = visibilityFilter === 'all' || repo.visibility === visibilityFilter
        const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter

        return matchesSearch && matchesVisibility && matchesLanguage
    });
}

describe("Repository Filtering Logic", () => {
  const mockRepos = [
    { id: 1, name: "gitpilot", owner: "user1", full_name: "user1/gitpilot", visibility: "Public", language: "TypeScript" },
    { id: 2, name: "website", owner: "org1", full_name: "org1/website", visibility: "Private", language: "JavaScript" },
    { id: 3, name: "backend", owner: "user1", full_name: "user1/backend", visibility: "Public", language: "Go" },
  ];

  it("should filter by visibility", () => {
    const results = filterRepositories(mockRepos, "", "Private");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("website");
  });

  it("should filter by language", () => {
    const results = filterRepositories(mockRepos, "", "all", "Go");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("backend");
  });

  it("should combine filters", () => {
    const results = filterRepositories(mockRepos, "git", "Public", "TypeScript");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("gitpilot");
  });
});
