'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, Building, Calendar } from 'lucide-react';
import type { Account } from '@/types/account';
import type { ApiResponse } from '@/types/api-errors';

interface AccountProfileProps {
  initialAccount?: Account;
}

export function AccountProfile({ initialAccount }: AccountProfileProps) {
  const [account, setAccount] = useState<Account | null>(initialAccount ?? null);
  const [isLoading, setIsLoading] = useState(!initialAccount);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAccount) return;

    async function fetchAccount() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/account');
        const json: ApiResponse<Account> = await res.json();

        if (json.error) {
          setError(json.error.message);
          return;
        }

        setAccount(json.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load account');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [initialAccount]);

  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-16 w-16"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#161b22] border border-red-800/50 rounded-lg p-6">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  const createdDate = new Date(account.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <img
          src={account.avatarUrl}
          alt={account.login}
          className="w-16 h-16 rounded-full border-2 border-gray-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white truncate">
              {account.name || account.login}
            </h2>
            {account.plan && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/50 rounded-full">
                {account.plan}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">@{account.login}</p>
          
          {account.bio && (
            <p className="text-gray-300 text-sm mt-2">{account.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
            {account.company && (
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {account.company}
              </span>
            )}
            {account.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {account.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {createdDate}
            </span>
          </div>

          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-gray-300">
              <strong className="text-white">{account.publicRepos}</strong> public repos
            </span>
            <span className="text-gray-300">
              <strong className="text-white">{account.privateRepos}</strong> private repos
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <a
          href={account.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View GitHub Profile
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
