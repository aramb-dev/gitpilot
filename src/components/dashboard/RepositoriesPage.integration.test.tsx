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
  RepositoryActions: ({ hasSelectedRepos, visibilityLabel, onToggleVisibility, onArchive, onDelete, onSearch, visibilityFilter, onVisibilityChange, languageFilter, onLanguageChange, languages }: any) => {
    return (
      <div data-testid="repository-actions">
        <button onClick={onToggleVisibility} disabled={false}> {/* Always enabled in test */}
          {hasSelectedRepos ? visibilityLabel : "make_public"}
        </button>
        <button onClick={onArchive} disabled={false}> {/* Always enabled in test */}
          archive
        </button>
        <button onClick={onDelete} disabled={false}> {/* Always enabled in test */}
          delete
        </button>
      </div>
    );
  },
}));

describe("RepositoriesPage Integration", () => {
  const mockRepos = [
    { id: 1, name: "repo1", owner: "user", full_name: "user/repo1", visibility: "Public", language: "TypeScript", updated: "2023-01-01", url: "https://github.com/user/repo1" },
    { id: 2, name: "repo2", owner: "user", full_name: "user/repo2", visibility: "Public", language: "JavaScript", updated: "2023-01-01", url: "https://github.com/user/repo2" },
  ];

  beforeEach(() => {
    // Mock window.location
    const mockLocation = { href: "" }; // @ts-ignore
    global.window.location = mockLocation;
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
            return Promise.resolve(new Response(JSON.stringify(mockRepos)));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: [], errors: [] })));
    }) as any;
  });

  it("should trigger visibility toggle API when button is clicked", async () => {
    global.fetch = mock((url, options) => {
      if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
        return Promise.resolve(new Response(JSON.stringify(mockRepos)));
      }
      if (url === "/api/github/repos/visibility" && options && options.method === "PATCH") {
        return Promise.resolve(new Response(JSON.stringify({ success: [{ name: "repo1" }], errors: [] })));
      }
      return Promise.resolve(new Response(JSON.stringify([])));
    }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    const repo1Card = await screen.findByTestId('repository-card-1');
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    // After clicking the checkbox, the button should change to 'make_private'
    const visibilityButton = await screen.findByRole("button", { name: /make_private/i, enabled: true }); 
    fireEvent.click(visibilityButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos/visibility", expect.objectContaining({
            method: "PATCH"
        }));
    });
  });

  it("should open archive modal and trigger API", async () => {
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
          return Promise.resolve(new Response(JSON.stringify(mockRepos)));
        }
        if (url === "/api/github/repos/archive" && options && options.method === "PATCH") {
          return Promise.resolve(new Response(JSON.stringify({ success: [{ name: "repo1" }], errors: [] })));
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    const repo1Card = await screen.findByTestId('repository-card-1');
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    const archiveButton = await screen.findByRole("button", { name: /archive/i, enabled: true });
    fireEvent.click(archiveButton);

    expect(screen.getByText("archive_repos")).toBeTruthy(); // Changed from "Archive Repositories"
    
    const confirmButton = screen.getByText("archive"); // Changed from "Confirm Action"
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
          return Promise.resolve(new Response(JSON.stringify(mockRepos)));
        }
        if (url === "/api/github/repos" && options && options.method === "DELETE") {
          return Promise.resolve(new Response(JSON.stringify({ success: [{ name: "repo1" }], errors: [] })));
        }
        return Promise.resolve(new Response(JSON.stringify([])));
      }) as any;

    render(React.createElement(RepositoriesPage, { repositories: mockRepos }));
    const repo1Card = await screen.findByTestId('repository-card-1');
    const repo1Checkbox = await within(repo1Card).findByRole('checkbox');
    await act(() => {
      fireEvent.click(repo1Checkbox);
    });

    // Directly assert that the checkbox is checked after click
    await waitFor(() => expect(repo1Checkbox.getAttribute('aria-checked')).toBe('true'));

    const deleteButton = await screen.findByRole("button", { name: /delete/i, enabled: true });
    fireEvent.click(deleteButton);

    expect(screen.getByText("delete_repos")).toBeTruthy(); // Changed from "Delete Repositories"
    
    const confirmButton = screen.getByText("delete"); // Changed from "Confirm Action"
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos", expect.objectContaining({
            method: "DELETE"
        }));
    });
  });
});