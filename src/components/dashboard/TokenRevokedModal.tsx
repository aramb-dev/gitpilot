'use client';

import { AlertCircle, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0d0d0d] border border-red-900 shadow-2xl p-8 max-w-md w-full mx-4 font-mono">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border border-red-900 bg-red-900/10">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
            // SESSION_EXPIRED
          </h2>
        </div>

        <p className="text-[#888] mb-4 text-sm leading-relaxed">
          &gt; Your GitHub access has been revoked or expired. Possible causes:
        </p>

        <ul className="text-xs text-[#666] mb-8 space-y-2">
          <li>[01] Access revoked via GitHub settings</li>
          <li>[02] Organization admin restricted access</li>
          <li>[03] Execution context timed out</li>
        </ul>

        <p className="text-[#888] mb-8 text-sm italic">
          Please re-authenticate to restore system access.
        </p>

        <div className="flex gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs text-[#666] hover:text-white border border-[#333] hover:border-[#666] transition-all"
            >
              CANCEL
            </button>
          )}
          <button
            onClick={handleSignIn}
            disabled={isRedirecting}
            className="flex-1 px-4 py-3 text-xs bg-[#00ff00] hover:bg-[#00cc00] text-black font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
          >
            {isRedirecting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black animate-spin" />
                REDIRECTING...
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                SIGN_IN_AGAIN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
