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
      className={`border p-4 font-mono ${
        isCritical
          ? 'bg-red-900/10 border-red-900/50'
          : 'bg-yellow-900/10 border-yellow-900/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-1.5 border flex-shrink-0 ${
            isCritical ? 'bg-red-900/30 border-red-900/50' : 'bg-yellow-900/30 border-yellow-900/50'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-bold uppercase tracking-tighter ${
              isCritical ? 'text-red-500' : 'text-yellow-500'
            }`}
          >
            // {isCritical ? 'RATE_LIMIT_CRITICAL' : 'RATE_LIMIT_WARNING'}
          </h4>
          <p className="text-xs text-[#888] mt-1">
            &gt; You have <strong className="text-white">{remaining.toLocaleString()}</strong> of{' '}
            {limit.toLocaleString()} API requests remaining.
            {isCritical && ' Bulk operations restricted.'}
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-[#1a1a1a] border border-[#333]">
            <div
              className={`h-full transition-all ${
                isCritical ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.max(percentage, 1)}%` }}
            />
          </div>

          {resetTime && (
            <p className="text-[10px] text-[#666] mt-2 flex items-center gap-1 uppercase">
              <Clock className="w-3 h-3" />
              RESETS_IN_{resetTime.replace(' ', '_')}
            </p>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-[10px] text-[#444] hover:text-[#00ff00] mt-2 transition-colors uppercase"
            >
              [dismiss]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
