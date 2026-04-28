'use client';

import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
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
        icon: <RefreshCw className="w-5 h-5 text-[#666] animate-spin" />,
        label: 'checking...',
        color: 'text-[#666]',
      };
    }

    if (isValid === true) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-[#00ff00]" />,
        label: 'connected',
        color: 'text-[#00ff00]',
      };
    }

    if (error?.code === 'TOKEN_REVOKED') {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        label: 'token_revoked',
        color: 'text-red-500',
      };
    }

    return {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      label: 'connection_issue',
      color: 'text-yellow-500',
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-[#0d0d0d] border border-[#333] p-6 font-mono">
      <h3 className="text-lg font-semibold text-white mb-4">// connection_status</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-[#1a1a1a] hover:bg-[#00ff00]/10 text-[#888] hover:text-[#00ff00] border border-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            verify_now
          </button>
        </div>

        {lastVerified && (
          <p className="text-sm text-[#666]">
            &gt; last_verified: {lastVerified.toLocaleTimeString()}
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-900/50">
            <p className="text-sm text-red-400">
              <span className="text-[#666]">error: </span>
              {error.message}
            </p>
          </div>
        )}

        {rateLimitRemaining !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666]">api_rate_limit</span>
            <span className={rateLimitRemaining < 100 ? 'text-yellow-500' : 'text-[#888]'}>
              {rateLimitRemaining.toLocaleString()} remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
