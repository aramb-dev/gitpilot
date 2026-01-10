'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTokenVerification } from '@/hooks/useTokenVerification';

export function ConnectionStatus() {
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  const { isValid, isLoading, rateLimitRemaining, error, refetch } = useTokenVerification({
    autoSignOut: false,
  });

  const handleVerify = async () => {
    await refetch();
    setLastVerified(new Date());
  };

  const getStatusDisplay = () => {
    if (isLoading && isValid === null) {
      return {
        icon: <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />,
        label: 'Checking...',
        color: 'text-gray-400',
      };
    }

    if (isValid === true) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        label: 'Connected',
        color: 'text-green-400',
      };
    }

    if (error?.code === 'TOKEN_REVOKED') {
      return {
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        label: 'Token Revoked',
        color: 'text-red-400',
      };
    }

    return {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      label: 'Connection Issue',
      color: 'text-yellow-400',
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Connection Status</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Verify Now
          </button>
        </div>

        {lastVerified && (
          <p className="text-sm text-gray-500">
            Last verified: {lastVerified.toLocaleTimeString()}
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-md">
            <p className="text-sm text-red-400">{error.message}</p>
          </div>
        )}

        {rateLimitRemaining !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">API Rate Limit</span>
            <span className={rateLimitRemaining < 100 ? 'text-yellow-400' : 'text-gray-300'}>
              {rateLimitRemaining.toLocaleString()} remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
