"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmButtonText = "Confirm",
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setUserInput("");
    }
  }, [isOpen]);

  const isConfirmDisabled = confirmText ? userInput !== confirmText : false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {confirmText && (
          <div className="py-4 space-y-2">
            <p className="text-sm font-medium">
              Please type <span className="font-bold">"{confirmText}"</span> to confirm.
            </p>
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={confirmText}
              autoFocus
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isConfirmDisabled || isLoading}
          >
            {isLoading ? "Processing..." : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
