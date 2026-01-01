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

  const isConfirmDisabled = confirmText 
    ? userInput.trim().toLowerCase() !== confirmText.toLowerCase() 
    : false;

  if (!isOpen) return null;

  return (
    <div 
        style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
        }}
    >
        <div 
            style={{ 
                backgroundColor: '#161b22', 
                border: '1px solid #f85149', 
                padding: '32px', 
                borderRadius: '12px', 
                maxWidth: '450px', 
                width: '100%', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                color: 'white'
            }}
        >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>{title}</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px' }}>{description}</p>

            {confirmText && (
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                        Please type <span style={{ fontWeight: 'bold' }}>"{confirmText}"</span> to confirm.
                    </p>
                    <input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={confirmText}
                        style={{ 
                            width: '100%', 
                            backgroundColor: '#0d1117', 
                            border: '1px solid #30363d', 
                            borderRadius: '6px', 
                            padding: '8px 12px', 
                            color: 'white',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'end', gap: '12px' }}>
                <button 
                    onClick={onClose} 
                    disabled={isLoading}
                    style={{ 
                        padding: '8px 16px', 
                        color: '#8b949e', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer' 
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isConfirmDisabled || isLoading}
                    style={{ 
                        padding: '8px 20px', 
                        borderRadius: '6px', 
                        fontWeight: 500, 
                        background: isDestructive ? '#f85149' : '#238636',
                        color: 'white',
                        border: 'none',
                        cursor: isConfirmDisabled ? 'not-allowed' : 'pointer',
                        opacity: isConfirmDisabled ? 0.5 : 1
                    }}
                >
                    {isLoading ? "Processing..." : confirmButtonText}
                </button>
            </div>
        </div>
    </div>
  );
}
