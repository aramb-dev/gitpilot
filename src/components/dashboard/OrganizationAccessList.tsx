'use client';

import { AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/github/org-status';
import type { OrganizationAccess } from '@/types/account';
import type { ApiResponse } from '@/types/api-errors';

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
      <div className="bg-[#0d0d0d] border border-[#333] p-6 font-mono">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#666]" />
          <h3 className="text-lg font-semibold text-white">// organization_access</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a1a1a]"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1a1a1a] w-1/3"></div>
                <div className="h-3 bg-[#1a1a1a] w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d0d0d] border border-red-900/50 p-6 font-mono">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#666]" />
          <h3 className="text-lg font-semibold text-white">// organization_access</h3>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">
            <span className="text-[#666]">error: </span>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#333] p-6 font-mono">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-[#666]" />
        <h3 className="text-lg font-semibold text-white">// organization_access</h3>
      </div>

      {orgs.length === 0 ? (
        <p className="text-[#666] text-sm">no organizations found, or access not granted.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#333]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={org.avatarUrl}
                  alt={org.login}
                  className="w-10 h-10 border border-[#333]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{org.login}</span>
                    {org.role && <span className="text-xs text-[#666] capitalize">{org.role}</span>}
                  </div>
                  {org.description && (
                    <p className="text-sm text-[#666] truncate max-w-xs">{org.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(org.status)}>
                  {getStatusLabel(org.status)}
                </Badge>

                {org.status === 'sso_required' && (
                  <a
                    href={`https://github.com/orgs/${org.login}/sso`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#666] hover:text-[#00ff00] transition-colors"
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
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-sm text-yellow-500">
            &gt; warning: some organizations require additional authorization via SSO.
          </p>
        </div>
      )}
    </div>
  );
}
