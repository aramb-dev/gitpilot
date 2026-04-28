'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  details: any;
  createdAt: string;
}

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-[#666] font-mono">loading_logs...</div>;

  return (
    <Card className="bg-[#0d0d0d] border-[#333]">
      <CardHeader className="border-b border-[#333]">
        <CardTitle className="text-lg font-mono text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00ff00]" />
          [audit_log]
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-[#1a1a1a]">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-[#666] text-sm italic font-mono">
                no_activity_recorded
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#111] transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00ff00] font-mono text-sm font-bold">
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-[#666] text-xs px-1.5 py-0.5 border border-[#333] rounded font-mono">
                        {log.resourceType}
                      </span>
                    </div>
                    <span className="text-[#666] text-xs font-mono">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <pre className="text-[#888] text-xs font-mono mt-2 p-2 bg-[#000] border border-[#333] overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
