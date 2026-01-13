import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl border border-[#333] bg-[#0d0d0d] shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#1a1a1a] border-b border-[#333] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00ff00]" />
            <span className="text-xs text-[#888] font-bold uppercase tracking-widest">system_shell</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#333]"></div>
            <div className="w-2.5 h-2.5 bg-[#333]"></div>
            <div className="w-2.5 h-2.5 bg-[#333]"></div>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-[#00ff00] text-sm">$ locate /requested/resource</p>
            <p className="text-red-500 text-sm">ERROR: 404 NOT_FOUND</p>
          </div>

          <div className="py-8 border-y border-[#1a1a1a]">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 italic">
              404
            </h1>
            <p className="text-[#666] text-sm uppercase tracking-widest">
              [status: unreachable_segment]
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[#888] text-sm leading-relaxed">
              &gt; The specified memory address could not be located in the current execution context.
              The resource may have been relocated, purged, or never existed in this timeline.
            </p>
            
            <div className="pt-4">
              <Link 
                href="/dashboard" 
                className="inline-block bg-[#00ff00] text-black font-black px-6 py-3 text-sm hover:bg-[#00cc00] transition-colors uppercase tracking-widest"
              >
                RETURN_TO_DASHBOARD
              </Link>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#0a0a0a] border-t border-[#333] px-4 py-2 flex justify-between items-center">
          <span className="text-[10px] text-[#444]">GITPILOT_v0.1.0_CORE</span>
          <span className="text-[10px] text-[#444]">DATE: 2026-01-13</span>
        </div>
      </div>
      
      {/* Glitch Effect Overlay (Simplified) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
}
