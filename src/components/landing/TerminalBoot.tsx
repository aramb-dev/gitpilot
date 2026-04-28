'use client';

import { type ReactNode, useState } from 'react';
import { TypewriterLines } from './Typewriter';

interface TerminalBootProps {
  onBootComplete: () => void;
  children?: ReactNode;
}

const BOOT_LINES = [
  '$ ./init.sh',
  '[OK] Loading GitPilot v0.1.0...',
  '[OK] Connecting to GitHub API...',
  '[OK] Initializing dashboard modules...',
  '[OK] Security protocols active...',
  '[OK] System ready.',
  '',
  '> Launching interface...',
];

export function TerminalBoot({ onBootComplete }: TerminalBootProps) {
  const [phase, setPhase] = useState<'booting' | 'complete'>('booting');

  const handleBootComplete = () => {
    setTimeout(() => {
      setPhase('complete');
      onBootComplete();
    }, 500);
  };

  return (
    <div
      className={`fixed inset-0 bg-[#0a0a0a] z-50 flex items-center justify-center transition-opacity duration-700 ${
        phase === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-2xl p-8">
        <div className="bg-[#0d0d0d] border border-[#333] rounded overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333] bg-[#0a0a0a]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
            <span className="ml-2 text-xs text-[#666]">terminal — gitpilot</span>
          </div>
          <div className="p-6 min-h-[300px] font-mono text-sm">
            <TypewriterLines
              lines={BOOT_LINES}
              typeDelay={20}
              lineDelay={150}
              onComplete={handleBootComplete}
              lineClassName="text-[#00ff00] mb-1"
              startDelay={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
