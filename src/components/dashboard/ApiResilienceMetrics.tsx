'use client';

import { useEffect, useState } from 'react';
import { Shield, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsStats {
  rateLimitHits: number;
  avgWaitTime: number;
  totalEvents: number;
}

interface MetricsData {
  recentEvents: any[];
  hourStats: MetricsStats;
  dayStats: MetricsStats;
}

export function ApiResilienceMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/audit/metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    // Refresh every minute
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#111] border border-[#222]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-500 text-xs font-mono">
        &gt; ERROR_FETCHING_METRICS: {error}
      </div>
    );
  }

  const { hourStats, dayStats } = data || {
    hourStats: { rateLimitHits: 0, avgWaitTime: 0, totalEvents: 0 },
    dayStats: { rateLimitHits: 0, avgWaitTime: 0, totalEvents: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rate Limit Hits */}
        <Card className="bg-black border-[#222] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              RATE_LIMIT_HITS_1H
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {hourStats.rateLimitHits}
            </div>
            <p className="text-[10px] text-[#444] mt-1 uppercase">
              {dayStats.rateLimitHits} IN_LAST_24H
            </p>
          </CardContent>
        </Card>

        {/* Avg Wait Time */}
        <Card className="bg-black border-[#222] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" />
              AVG_WAIT_TIME_1H
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(hourStats.avgWaitTime / 1000)}s
            </div>
            <p className="text-[10px] text-[#444] mt-1 uppercase">
              {Math.round(dayStats.avgWaitTime / 1000)}s AVG_24H
            </p>
          </CardContent>
        </Card>

        {/* Resilience Index (Success rate of retries) */}
        <Card className="bg-black border-[#222] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3" />
              RESILIENCE_ACTIVITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00ff00]">
              {hourStats.totalEvents}
            </div>
            <p className="text-[10px] text-[#444] mt-1 uppercase">
              RETRY_EVENTS_HANDLED
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events List */}
      <div className="border border-[#222] bg-black">
        <div className="p-3 border-b border-[#222] bg-[#0a0a0a]">
          <h3 className="text-[10px] font-bold text-[#666] uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            RECENT_RESILIENCE_EVENTS
          </h3>
        </div>
        <div className="divide-y divide-[#111]">
          {data?.recentEvents.length === 0 ? (
            <div className="p-8 text-center text-[#333] text-[10px] uppercase font-mono">
              no_recent_events_logged
            </div>
          ) : (
            data?.recentEvents.map((event: any) => (
              <div key={event.id} className="p-3 flex items-center justify-between font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white truncate max-w-[300px]" title={event.endpoint}>
                    {new URL(event.endpoint).pathname}
                  </span>
                  <span className="text-[9px] text-[#444] uppercase">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] uppercase ${
                      event.source === 'rate_limit' ? 'text-yellow-500' : 
                      event.source === 'server_error' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {event.source.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-[#444]">
                      ATTEMPT_{event.attempt + 1}
                    </span>
                  </div>
                  <div className="min-w-[40px] text-right">
                    <span className="text-[10px] text-[#666]">
                      {event.waitTimeMs > 0 ? `${Math.round(event.waitTimeMs / 1000)}s` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
