import { describe, expect, it, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationModal } from "./ConfirmationModal";
import React from "react";

// Minimal mock for Radix Dialog since it might not work well in happy-dom/jsdom without polyfills
mock.module("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <footer>{children}</footer>,
}));

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: mock(() => {}),
    onConfirm: mock(() => {}),
    title: "Confirm Action",
    description: "Are you sure?",
  };

  it("should render title and description", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeTruthy();
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const onConfirm = mock(() => {});
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("should require specific text if confirmText is provided", () => {
    const onConfirm = mock(() => {});
    render(
      <ConfirmationModal 
        {...defaultProps} 
        onConfirm={onConfirm} 
        confirmText="DELETE" 
      />
    );
    
    const confirmButton = screen.getByText("Confirm");
    
    // Should be disabled initially
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(0);

    // Type wrong text
    const input = screen.getByPlaceholderText("DELETE");
    fireEvent.change(input, { target: { value: "WRONG" } });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(0);

    // Type correct text
    fireEvent.change(input, { target: { value: "DELETE" } });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should show processing state and disable buttons when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Processing...")).toBeTruthy();
    
    const cancelButton = screen.getByText("Cancel");
    // In many UI kits, disabled attribute is checked
    expect((cancelButton as HTMLButtonElement).disabled).toBe(true);
  });
});
