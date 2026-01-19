// @ts-nocheck
// @bun-test-dom
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { RepositoriesPage } from "./RepositoriesPage";
import React from "react";

// Mock sonner
mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
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
        <button onClick={onToggleVisibility} disabled={false}> {/* Always enabled in test */}
          {hasSelectedRepos ? visibilityLabel : "make_public"}
        </button>
        <button onClick={onArchive} disabled={false}> {/* Always enabled in test */}
          archive
        </button>
        <button onClick={onUnarchive} disabled={false}> {/* Always enabled in test */}
          unarchive
        </button>
        <button onClick={onDelete} disabled={false}> {/* Always enabled in test */}
          delete
        </button>
      </div>
    );
  },
}));

describe("RepositoriesPage Integration", () => {
  const recentDate = new Date().toISOString();
  const mockRepos = [
    { id: 1, name: "repo1", owner: "user", full_name: "user/repo1", visibility: "public", language: "TypeScript", updated_at: recentDate, created_at: recentDate, url: "https://github.com/user/repo1", html_url: "https://github.com/user/repo1", permissions: { admin: true, push: true, pull: true } },
    { id: 2, name: "repo2", owner: "user", full_name: "user/repo2", visibility: "public", language: "JavaScript", updated_at: recentDate, created_at: recentDate, url: "https://github.com/user/repo2", html_url: "https://github.com/user/repo2", permissions: { admin: true, push: true, pull: true } },
  ];

  beforeEach(() => {
    // Mock window.location
    const mockLocation = { href: "" }; // @ts-ignore
    global.window.location = mockLocation;
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
            return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: [], errors: [] })));
    }) as any;
  });

  it("should trigger visibility toggle API when button is clicked", async () => {
    global.fetch = mock((url, options) => {
      if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
        return Promise.resolve(new Response(JSON.stringify({ data: mockRepos })));
      }
      if (url === "/api/github/repos/visibility" && options && options.method === "PATCH") {
        return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/repo1" }], errors: [] })));
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
          return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/repo1" }], errors: [] })));
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
    
    const confirmButton = screen.getByRole("button", { name: /^archive$/i }); 
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
          return Promise.resolve(new Response(JSON.stringify({ success: [{ full_name: "user/repo1" }], errors: [] })));
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
    const input = await screen.findByTestId("modal-input");
    fireEvent.change(input, { target: { value: "repo1" } });

    const confirmButton = screen.getByText("delete"); 
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos", expect.objectContaining({
            method: "DELETE"
        }));
    });
  });
});