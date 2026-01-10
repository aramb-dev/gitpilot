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
    <div className="bg-[#161b22] border border-red-900/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#0d1117] border border-gray-800 rounded-lg">
          <div>
            <p className="font-medium text-white">Sign Out</p>
            <p className="text-sm text-gray-400">
              Sign out of GitPilot. You can sign back in anytime.
            </p>
          </div>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={isSigningOut}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isSigningOut ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    Confirm Sign Out
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1.5 text-sm border border-red-800 text-red-400 hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-[#0d1117] border border-gray-800 rounded-lg">
          <div>
            <p className="font-medium text-white">Revoke Access</p>
            <p className="text-sm text-gray-400">
              Revoke GitPilot's access to your GitHub account entirely.
            </p>
          </div>
          <a
            href="https://github.com/settings/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-md transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub Settings
          </a>
        </div>
      </div>
    </div>
  );
}
