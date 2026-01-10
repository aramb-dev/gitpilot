'use client';

import { useEffect, useState } from 'react';
import { Shield, ExternalLink, Check } from 'lucide-react';
import { SCOPE_DESCRIPTIONS } from '@/types/account';

interface PermissionsDisplayProps {
  initialScopes?: string[];
}

export function PermissionsDisplay({ initialScopes }: PermissionsDisplayProps) {
  const [scopes, setScopes] = useState<string[]>(initialScopes ?? []);
  const [isLoading, setIsLoading] = useState(!initialScopes);

  useEffect(() => {
    if (initialScopes) return;

    async function fetchScopes() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/verify');
        const json = await res.json();

        if (json.valid && json.scopes) {
          setScopes(json.scopes);
        }
      } catch {
        // Silently fail - scopes are not critical
      } finally {
        setIsLoading(false);
      }
    }

    fetchScopes();
  }, [initialScopes]);

  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Permissions</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white">Permissions</h3>
      </div>

      {scopes.length === 0 ? (
        <p className="text-gray-400 text-sm">No scopes detected. This may indicate a connection issue.</p>
      ) : (
        <div className="space-y-3">
          {scopes.map((scope) => (
            <div key={scope} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <code className="text-sm text-blue-400 font-mono">{scope}</code>
                <p className="text-sm text-gray-400">
                  {SCOPE_DESCRIPTIONS[scope] || 'Custom scope'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800">
        <a
          href="https://github.com/settings/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Manage OAuth apps on GitHub
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
