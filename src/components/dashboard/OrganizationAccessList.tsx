'use client';

import { useEffect, useState } from 'react';
import { Building2, ExternalLink, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { OrganizationAccess } from '@/types/account';
import type { ApiResponse } from '@/types/api-errors';
import { getStatusLabel, getStatusColor } from '@/lib/github/org-status';

export function OrganizationAccessList() {
  const [orgs, setOrgs] = useState<OrganizationAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgStatuses() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/github/orgs/status');
        const json: ApiResponse<OrganizationAccess[]> = await res.json();

        if (json.error) {
          setError(json.error.message);
          return;
        }

        setOrgs(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrgStatuses();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Organization Access</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#161b22] border border-red-800/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Organization Access</h3>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white">Organization Access</h3>
      </div>

      {orgs.length === 0 ? (
        <p className="text-gray-400 text-sm">
          You are not a member of any organizations, or your organizations have not granted access to GitPilot.
        </p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-3 bg-[#0d1117] border border-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={org.avatarUrl}
                  alt={org.login}
                  className="w-10 h-10 rounded-md border border-gray-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{org.login}</span>
                    {org.role && (
                      <span className="text-xs text-gray-500 capitalize">{org.role}</span>
                    )}
                  </div>
                  {org.description && (
                    <p className="text-sm text-gray-400 truncate max-w-xs">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(org.status)}
                >
                  {getStatusLabel(org.status)}
                </Badge>

                {org.status === 'sso_required' && (
                  <a
                    href={`https://github.com/orgs/${org.login}/sso`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Authorize SSO"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orgs.some((org) => org.status !== 'accessible') && (
        <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-800/30 rounded-md">
          <p className="text-sm text-yellow-400">
            Some organizations require additional authorization. Click the link icon to authorize GitPilot for SSO-protected organizations.
          </p>
        </div>
      )}
    </div>
  );
}
