// @bun-test-dom
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RepositoriesPage } from "./RepositoriesPage";
import React from "react";

// Mock sonner
mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}));

// Mock window.location
const mockLocation = { href: "" };
global.window.location = mockLocation;

// Mock ConfirmationModal to avoid Radix issues in this test
mock.module("./ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm, title, confirmText }) => {
    if (!isOpen) return null;
    return React.createElement("div", { "data-testid": "modal" }, [
        React.createElement("h2", { key: "title" }, title),
        confirmText && React.createElement("input", { key: "input", "data-testid": "modal-input" }),
        React.createElement("button", { key: "confirm", onClick: onConfirm }, "Confirm Action")
    ]);
  }
}));

describe("RepositoriesPage Integration", () => {
  const mockRepos = [
    { id: 1, name: "repo1", owner: "user", full_name: "user/repo1", visibility: "Public", language: "TypeScript", updated: "2023-01-01" },
    { id: 2, name: "repo2", owner: "user", full_name: "user/repo2", visibility: "Public", language: "JavaScript", updated: "2023-01-01" },
  ];

  beforeEach(() => {
    global.fetch = mock((url, options) => {
        if (url.includes("/api/github/repos") && (!options || options.method === "GET")) {
            return Promise.resolve(new Response(JSON.stringify(mockRepos)));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: [], errors: [] })));
    });
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
    });

    render(React.createElement(RepositoriesPage));
    await waitFor(() => expect(screen.getByText("repo1")).toBeTruthy());

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    const visibilityButton = screen.getByText("Make Private");
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
      });

    render(React.createElement(RepositoriesPage));
    await waitFor(() => expect(screen.getByText("repo1")).toBeTruthy());

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    const archiveButton = screen.getByText("Archive");
    fireEvent.click(archiveButton);

    expect(screen.getByText("Archive Repositories")).toBeTruthy();
    
    const confirmButton = screen.getByText("Confirm Action");
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
      });

    render(React.createElement(RepositoriesPage));
    await waitFor(() => expect(screen.getByText("repo1")).toBeTruthy());

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Delete Repositories")).toBeTruthy();
    
    const confirmButton = screen.getByText("Confirm Action");
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/github/repos", expect.objectContaining({
            method: "DELETE"
        }));
    });
  });
});