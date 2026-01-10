'use client';

import { AlertTriangle, Clock } from 'lucide-react';

interface RateLimitWarningProps {
  remaining: number;
  limit: number;
  resetAt?: number;
  onDismiss?: () => void;
}

export function RateLimitWarning({
  remaining,
  limit,
  resetAt,
  onDismiss,
}: RateLimitWarningProps) {
  const percentage = (remaining / limit) * 100;
  const isLow = remaining < 100;
  const isCritical = remaining < 10;

  const getResetTimeString = () => {
    if (!resetAt) return null;
    const resetDate = new Date(resetAt * 1000);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'now';
    
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    
    const diffHours = Math.ceil(diffMins / 60);
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  const resetTime = getResetTimeString();

  if (!isLow) return null;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isCritical
          ? 'bg-red-900/10 border-red-800/30'
          : 'bg-yellow-900/10 border-yellow-800/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-1.5 rounded-full flex-shrink-0 ${
            isCritical ? 'bg-red-900/30' : 'bg-yellow-900/30'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium ${
              isCritical ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {isCritical ? 'Rate Limit Critical' : 'Rate Limit Warning'}
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            You have <strong className="text-white">{remaining.toLocaleString()}</strong> of{' '}
            {limit.toLocaleString()} API requests remaining.
            {isCritical && ' Bulk operations are temporarily disabled.'}
          </p>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isCritical ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.max(percentage, 1)}%` }}
            />
          </div>

          {resetTime && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Resets in {resetTime}
            </p>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-gray-400 hover:text-white mt-2 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
