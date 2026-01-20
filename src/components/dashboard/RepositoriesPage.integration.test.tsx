// @ts-nocheck
// @bun-test-dom
import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { render, screen, fireEvent, waitFor, within, act, cleanup } from "@testing-library/react";
import { RepositoriesPage } from "./RepositoriesPage";
import React from "react";

const originalFetch = global.fetch;

const basePreferences = {
  defaultVisibility: "all",
  itemsPerPage: 10,
  showArchived: true,
  showForks: true,
  selectedOrgs: ["acme-org"],
};
let mockPreferences = { ...basePreferences };

// Mock sonner
mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}));

mock.module("@/hooks/usePreferences", () => ({
  usePreferences: mock(() => ({
    preferences: mockPreferences,
    updatePreferences: mock(() => {}),
    isLoading: false,
  })),
}));

// Mock ConfirmationModal to avoid Radix issues in this test
mock.module("./ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm, title, confirmText, confirmButtonText = "confirm", isLoading = false }: any) => {
    if (!isOpen) return null;
    return React.createElement("div", { "data-testid": "modal" }, [
        React.createElement("h2", { key: "title" }, title),
        confirmText && React.createElement("input", { key: "input", "data-testid": "modal-input" }),
        React.createElement("button", { key: "confirm", onClick: onConfirm }, isLoading ? "processing..." : confirmButtonText)
    ]);
  }
}));

mock.module("./BulkOperationModal", () => ({
  BulkOperationModal: ({ isOpen }: any) => {
    if (!isOpen) return null;
    return React.createElement("div", { "data-testid": "bulk-operation-modal" });
  },
}));

// Mock usePreferences to return a consistent set of preferences
mock.module("@/hooks/usePreferences", () => ({
  usePreferences: mock(() => ({
    preferences: {
      defaultVisibility: "all",
      itemsPerPage: 30,
    },
    updatePreferences: mock(() => {}),
    isLoading: false,
  })),
}));

// Mock RepositoryActions to always have its buttons enabled for testing interactions
mock.module("./RepositoryActions", () => ({
  RepositoryActions: ({ hasSelectedRepos, visibilityLabel, onToggleVisibility, onArchive, onUnarchive, onDelete, onSearch, visibilityFilter, onVisibilityChange, languageFilter, onLanguageChange, languages, sortValue, onSortChange }: any) => {
    return (
      <div data-testid="repository-actions">
        <input
          aria-label="search"
          onChange={(event) => onSearch(event.target.value)}
        />
        <select
          aria-label="visibility-filter"
          value={visibilityFilter}
          onChange={(event) => onVisibilityChange(event.target.value)}
        >
          <option value="all">all_visibility</option>
          <option value="public">public</option>
          <option value="private">private</option>
        </select>
        <select
          aria-label="language-filter"
          value={languageFilter}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          <option value="all">all_languages</option>
          {languages.map((language: string) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <select
          aria-label="sort-filter"
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="updated">last_updated</option>
          <option value="name">name_asc</option>
          <option value="stars">stars_count</option>
          <option value="created">created_at</option>
        </select>
        <button onClick={onToggleVisibility} disabled={!hasSelectedRepos}>
          {hasSelectedRepos ? visibilityLabel : "make_public"}
        </button>
        <button onClick={onArchive} disabled={!hasSelectedRepos}>
          archive
        </button>
        <button onClick={onUnarchive} disabled={!hasSelectedRepos}>
          unarchive
        </button>
        <button onClick={onDelete} disabled={!hasSelectedRepos}>
          delete
        </button>
      </div>
    );
  },
}));

describe("RepositoriesPage Integration", () => {
  const recentDate = new Date("2024-02-02T00:00:00.000Z").toISOString();
  const olderDate = new Date("2024-01-02T00:00:00.000Z").toISOString();
  const oldestDate = new Date("2023-12-02T00:00:00.000Z").toISOString();
  const mockRepos = [
    {
      id: 1,
      name: "alpha",
      owner: "user",
      owner_type: "User",
      full_name: "user/alpha",
      visibility: "public",
      language: "TypeScript",
      archived: false,
      disabled: false,
      fork: false,
      description: null,
      default_branch: "main",
      stars: 5,
      forks: 2,
      open_issues: 0,
      updated_at: recentDate,
      created_at: olderDate,
      pushed_at: recentDate,
      url: "https://github.com/user/alpha",
      html_url: "https://github.com/user/alpha",
      clone_url: "https://github.com/user/alpha.git",
      permissions: { admin: true, push: true, pull: true },
    },
    {
      id: 2,
      name: "beta",
      owner: "user",
      owner_type: "User",
      full_name: "user/beta",
      visibility: "private",
      language: "Go",
      archived: false,
      disabled: false,
      fork: false,
      description: null,
      default_branch: "main",
      stars: 12,
      forks: 1,
      open_issues: 3,
      updated_at: olderDate,
      created_at: oldestDate,
      pushed_at: olderDate,
      url: "https://github.com/user/beta",
      html_url: "https://github.com/user/beta",
      clone_url: "https://github.com/user/beta.git",
      permissions: { admin: true, push: true, pull: true },
    },
    {
      id: 3,
      name: "gamma",
      owner: "org",
      owner_type: "Organization",
      full_name: "org/gamma",
      visibility: "public",
      language: "JavaScript",
      archived: true,
      disabled: false,
      fork: true,
      description: null,
      default_branch: "main",
      stars: 1,
      forks: 0,
      open_issues: 0,
      updated_at: oldestDate,
      created_at: oldestDate,
      pushed_at: null,
      url: "https://github.com/org/gamma",
      html_url: "https://github.com/org/gamma",
      clone_url: "https://github.com/org/gamma.git",
      permissions: { admin: true, push: true, pull: true },
    },
  ];

  beforeEach(() => {
    Object.assign(mockPreferences, basePreferences);
    // Mock window.location
    const mockLocation = { href: "" }; // @ts-ignore
    global.window.location = mockLocation;
    global.fetch = mock((url, options) => {
        if (url === "/api/preferences") {
            return Promise.resolve(new Response(JSON.stringify(mockPreferences)));
        }
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
            return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: [], errors: [] })));
    }) as any;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("loads repositories from the API when no initial data provided", async () => {
    global.fetch = mock((url, options) => {
      if (url === "/api/preferences") {
        return Promise.resolve(new Response(JSON.stringify(mockPreferences)));
      }
      if (typeof url === "string" && url.startsWith("/api/github/repos") && (!options || options.method === "GET")) {
        return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
      }
      return Promise.resolve(new Response(JSON.stringify({ success: [], errors: [] })));
    }) as any;

    render(React.createElement(RepositoriesPage));

    expect(await screen.findByText("alpha")).toBeTruthy();

    const calls = (global.fetch as any).mock.calls;
    const repoCall = calls.find((call: any[]) => typeof call[0] === "string" && call[0].startsWith("/api/github/repos"));
    expect(repoCall).toBeTruthy();
  });

  it("shows a loading state while repositories are fetched", async () => {
    let resolveFetch: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    global.fetch = mock(() => pendingFetch) as any;

    render(React.createElement(RepositoriesPage));

    expect(await screen.findByText("loading...")).toBeTruthy();

    resolveFetch!(new Response(JSON.stringify({ data: mockRepos })));
    expect(await screen.findByText("alpha")).toBeTruthy();
  });

  it("renders an error message when fetch fails", async () => {
    global.fetch = mock(() => Promise.resolve(new Response("fail", { status: 500 }))) as any;

    render(React.createElement(RepositoriesPage));

    expect(await screen.findByText(/fail/i)).toBeTruthy();
  });

  it("filters repositories with search and resets selections", async () => {
    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));

    const selectAllLabel = await screen.findByText(/select all/i);
    const selectAllCheckbox = within(selectAllLabel.parentElement!).getByRole("checkbox");
    fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(selectAllCheckbox.getAttribute("aria-checked")).toBe("true");
    });

    const searchInput = screen.getByLabelText(/search/i);
    fireEvent.change(searchInput, { target: { value: "beta" } });

    await waitFor(() => {
      expect(selectAllCheckbox.getAttribute("aria-checked")).toBe("false");
      expect(screen.queryByTestId("repository-card-1")).toBeNull();
    });
    expect(await screen.findByTestId("repository-card-2")).toBeTruthy();
  });

  it("applies visibility and language filters", async () => {
    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));

    const visibilitySelect = screen.getByLabelText("visibility-filter");
    fireEvent.change(visibilitySelect, { target: { value: "private" } });

    expect(await screen.findByTestId("repository-card-2")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByTestId("repository-card-1")).toBeNull();
    });

    const languageSelect = screen.getByLabelText("language-filter");
    fireEvent.change(languageSelect, { target: { value: "Go" } });

    expect(screen.getByTestId("repository-card-2")).toBeTruthy();
  });

  it("sorts repositories based on selected sort option", async () => {
    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));

    const sortSelect = screen.getByLabelText("sort-filter");
    fireEvent.change(sortSelect, { target: { value: "stars" } });

    await waitFor(() => {
      const cards = Array.from(document.querySelectorAll("[data-testid^='repository-card-']"));
      expect(cards[0]?.getAttribute("data-testid")).toBe("repository-card-2");
    });
  });

  it("paginates repositories based on user preference", async () => {
    const baseRepos = mockRepos.filter((repo) => repo.id !== 3);
    const pagedRepos = [
      ...baseRepos,
      ...Array.from({ length: 33 }, (_, index) => ({
        ...mockRepos[0],
        id: 10 + index,
        name: `extra-${index}`,
        full_name: `user/extra-${index}`,
        html_url: `https://github.com/user/extra-${index}`,
        clone_url: `https://github.com/user/extra-${index}.git`,
        updated_at: new Date(Date.UTC(2024, 0, 10 + index)).toISOString(),
        created_at: new Date(Date.UTC(2023, 11, 10 + index)).toISOString(),
        pushed_at: new Date(Date.UTC(2024, 0, 10 + index)).toISOString(),
      })),
    ];

    render(React.createElement(RepositoriesPage, { repositories: pagedRepos }));

    const pagination = screen.getByText(/of/).closest("div");
    const summary = pagination?.querySelector("span");
    expect(summary?.textContent).toContain("of 35");
    const beforeSummary = summary?.textContent;

    const paginationButtons = pagination?.querySelectorAll("button");
    fireEvent.click(paginationButtons?.[1] as Element);

    await waitFor(() => {
      expect(summary?.textContent).toContain("of 35");
      expect(summary?.textContent).not.toBe(beforeSummary);
    });
  });

  it("respects preferences that hide archived and forked repos", async () => {
    Object.assign(mockPreferences, { showArchived: false, showForks: false });

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));

    expect(await screen.findByTestId("repository-card-1")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByTestId("repository-card-3")).toBeNull();
    });
  });

  it("should trigger visibility toggle API when button is clicked", async () => {
    global.fetch = mock((url, options) => {
      if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
        return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
      }
      if (url === "/api/github/repos/visibility" && options && options.method === "PATCH") {
        return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/alpha" }], errors: [] })));
      }
      return Promise.resolve(new Response(JSON.stringify([])));
    }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    
    // Find all repository cards and pick the first one
    const repoCards = await screen.findAllByTestId('repository-card-1');
    const repo1Card = repoCards[0];
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    // After clicking the checkbox, the button should change to 'make_private'
    const actionsContainers = screen.getAllByTestId("repository-actions");
    const actionsContainer = actionsContainers[0];
    const visibilityButton = await within(actionsContainer).findByRole("button", { name: /^make_private$/i }); 
    fireEvent.click(visibilityButton);

    // Confirm in modal
    const confirmButton = await screen.findByText("confirm_change");
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos/visibility", expect.objectContaining({
            method: "PATCH"
        }));
    });
  });

  it("should open archive modal and trigger API", async () => {
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
          return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
        }
        if (url === "/api/github/repos/archive" && options && options.method === "PATCH") {
          return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/alpha" }], errors: [] })));
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    const repoCards = await screen.findAllByTestId('repository-card-1');
    const repo1Card = repoCards[0];
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    const actionsContainers = screen.getAllByTestId("repository-actions");
    const actionsContainer = actionsContainers[0];
    const archiveButton = await within(actionsContainer).findByRole("button", { name: /^archive$/i });
    fireEvent.click(archiveButton);

    expect(screen.getByText(/^archive_repos$/i)).toBeTruthy(); 
    
    const modal = await screen.findByTestId("modal");
    const confirmButton = within(modal).getByRole("button", { name: /^archive$/i }); 
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos/archive", expect.objectContaining({
            method: "PATCH"
        }));
    });
  });

  it("should open delete modal and trigger API", async () => {
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
          return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
        }
        if (url === "/api/github/repos" && options && options.method === "DELETE") {
          return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/alpha" }], errors: [] })));
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    const repoCards = await screen.findAllByTestId('repository-card-1');
    const repo1Card = repoCards[0];
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    const actionsContainers = screen.getAllByTestId("repository-actions");
    const actionsContainer = actionsContainers[0];
    const deleteButton = await within(actionsContainer).findByRole("button", { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText("delete_repos")).toBeTruthy(); 
    
    // Type repo name to confirm
    const modal = await screen.findByTestId("modal");
    const input = within(modal).getByTestId("modal-input");
    fireEvent.change(input, { target: { value: "alpha" } });

    const confirmButton = within(modal).getByRole("button", { name: /^delete$/i }); 
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos", expect.objectContaining({
            method: "DELETE"
        }));
    });
  });
});
