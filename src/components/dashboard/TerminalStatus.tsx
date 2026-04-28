'use client';

import { useEffect, useState } from 'react';

export function TerminalStatus() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    mem: 0,
    api: 100,
    status: 'ONLINE',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.floor(Math.random() * 15) + 5,
        mem: Math.floor(Math.random() * 20) + 40,
        api: prev.api > 50 ? prev.api - (Math.random() > 0.8 ? 1 : 0) : 100,
        status: 'ONLINE',
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 p-3 bg-[#0d0d0d] border border-[#333] font-mono text-[10px] space-y-1">
      <div className="flex justify-between">
        <span className="text-[#666]">SYS_STATUS:</span>
        <span className="text-[#00ff00] animate-pulse">{metrics.status}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#666]">CPU_LOAD:</span>
        <span className="text-white">{metrics.cpu}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#666]">MEM_USAGE:</span>
        <span className="text-white">{metrics.mem}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#666]">API_LIMIT:</span>
        <span className="text-[#00ff00]">{metrics.api}/5000</span>
      </div>
      <div className="mt-2 w-full bg-[#1a1a1a] h-1">
        <div 
          className="bg-[#00ff00] h-full transition-all duration-1000" 
          style={{ width: `${(metrics.api / 5000) * 100}%` }}
        />
      </div>
    </div>
  );
}
