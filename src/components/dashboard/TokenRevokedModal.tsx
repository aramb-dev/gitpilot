'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { clearLocalStorage } from '@/lib/auth/signout';

interface TokenRevokedModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function TokenRevokedModal({ isOpen, onClose }: TokenRevokedModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Clear local storage when token is revoked
      clearLocalStorage();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsRedirecting(true);
    await signIn('github', { callbackUrl: '/dashboard/repos' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#161b22] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-900/30 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Session Expired</h2>
        </div>

        <p className="text-gray-300 mb-2">
          Your GitHub access has been revoked or expired. This can happen if:
        </p>

        <ul className="text-sm text-gray-400 mb-6 space-y-1 list-disc list-inside">
          <li>You revoked GitPilot's access in GitHub settings</li>
          <li>An organization admin revoked the app's access</li>
          <li>Your session timed out</li>
        </ul>

        <p className="text-gray-300 mb-6">
          Please sign in again to continue using GitPilot.
        </p>

        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSignIn}
            disabled={isRedirecting}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRedirecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In Again
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
