'use client';

import { useEffect, useState } from 'react';

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
  confirmButtonText = 'confirm',
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUserInput('');
    }
  }, [isOpen]);

  const isConfirmDisabled = confirmText
    ? userInput.trim().toLowerCase() !== confirmText.toLowerCase()
    : false;
  const borderColor = isDestructive ? '#dc2626' : '#00ff00';

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <div
        style={{
          backgroundColor: '#0d0d0d',
          border: `1px solid ${borderColor}`,
          padding: '32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
          color: '#e0e0e0',
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: isDestructive ? '#dc2626' : '#00ff00',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: '#888',
            marginBottom: '24px',
            fontSize: '0.875rem',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {description}
        </p>

        {confirmText && (
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontSize: '0.75rem',
                marginBottom: '8px',
                color: '#666',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              &gt; type{' '}
              <span style={{ color: isDestructive ? '#dc2626' : '#00ff00' }}>"{confirmText}"</span>{' '}
              to confirm
            </p>
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={confirmText}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                border: `1px solid ${borderColor}`,
                padding: '10px 12px',
                color: '#e0e0e0',
                outline: 'none',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.875rem',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              color: '#888',
              background: 'transparent',
              border: '1px solid #333',
              cursor: 'pointer',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.875rem',
            }}
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled || isLoading}
            style={{
              padding: '8px 20px',
              fontWeight: 500,
              background: isDestructive ? '#dc2626' : '#00ff00',
              color: isDestructive ? 'white' : 'black',
              border: `1px solid ${isDestructive ? '#dc2626' : '#00ff00'}`,
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer',
              opacity: isConfirmDisabled ? 0.3 : 1,
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.875rem',
            }}
          >
            {isLoading ? 'processing...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
