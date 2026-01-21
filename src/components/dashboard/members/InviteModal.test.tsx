// @ts-nocheck
// @bun-test-dom
import { describe, expect, it, mock } from "bun:test";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { InviteModal } from "./InviteModal";

// Minimal mock for Radix Dialog to keep tests DOM-friendly.
mock.module("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <footer>{children}</footer>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogPortal: ({ children }: any) => <div>{children}</div>,
  DialogOverlay: () => null,
}));

import { afterEach } from "bun:test";
afterEach(() => {
  cleanup();
});

describe("InviteModal", () => {
  it("disables send without a target and sends with default role", () => {
    const onInvite = mock(() => { });
    render(
      <InviteModal
        isOpen={true}
        onClose={mock(() => { })}
        onInvite={onInvite}
      />
    );

    const sendButton = screen.getByRole("button", { name: /send_invitation/i });
    expect((sendButton as HTMLButtonElement).disabled).toBe(true);

    const input = screen.getByPlaceholderText(/username or email/i);
    fireEvent.change(input, { target: { value: "octocat" } });

    expect((sendButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(sendButton);

    expect(onInvite).toHaveBeenCalledWith("octocat", "direct_member");
  });

  it("sends with admin role when selected", () => {
    const onInvite = mock(() => { });
    render(
      <InviteModal
        isOpen={true}
        onClose={mock(() => { })}
        onInvite={onInvite}
      />
    );

    const input = screen.getByPlaceholderText(/username or email/i);
    fireEvent.change(input, { target: { value: "admin-user" } });

    const adminButton = screen.getByRole("button", { name: /owner/i });
    fireEvent.click(adminButton);

    fireEvent.click(screen.getByRole("button", { name: /send_invitation/i }));
    expect(onInvite).toHaveBeenCalledWith("admin-user", "admin");
  });

  it("calls onClose when cancel is clicked", () => {
    const onClose = mock(() => { });
    render(
      <InviteModal
        isOpen={true}
        onClose={onClose}
        onInvite={mock(() => { })}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
