'use client';

import { useState } from 'react';
import { AlertTriangle, LogOut, ExternalLink } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function AccountDangerZone() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    // Clear localStorage items
    try {
      localStorage.removeItem('selected_orgs');
      localStorage.removeItem('gitpilot_preferences');
    } catch {
      // Ignore localStorage errors
    }

    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="bg-[#0d0d0d] border border-red-900/50 p-6 font-mono">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-white">// danger_zone</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333]">
          <div>
            <p className="font-medium text-white">sign_out</p>
            <p className="text-sm text-[#666]">
              sign out of gitpilot. you can sign back in anytime.
            </p>
          </div>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm text-[#888] hover:text-white transition-colors"
                disabled={isSigningOut}
              >
                cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSigningOut ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-none animate-spin"></span>
                    signing_out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    confirm_sign_out
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1.5 text-sm border border-red-900 text-red-500 hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              sign_out
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333]">
          <div>
            <p className="font-medium text-white">revoke_access</p>
            <p className="text-sm text-[#666]">
              revoke gitpilot's access to your github account entirely.
            </p>
          </div>
          <a
            href="https://github.com/settings/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm border border-[#333] text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            github_settings
          </a>
        </div>
      </div>
    </div>
  );
}
