'use client';

import { CircleDot, CheckCircle2, Circle } from 'lucide-react';

interface StateFilterProps {
  value: 'open' | 'closed' | 'all';
  onChange: (state: 'open' | 'closed' | 'all') => void;
}

export function StateFilter({ value, onChange }: StateFilterProps) {
  const states = [
    { id: 'open' as const, label: 'Open', icon: CircleDot, color: 'text-green-500' },
    { id: 'closed' as const, label: 'Closed', icon: CheckCircle2, color: 'text-purple-500' },
    { id: 'all' as const, label: 'All', icon: Circle, color: 'text-gray-400' },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] p-1 font-mono">
      {states.map((state) => {
        const Icon = state.icon;
        const isActive = value === state.id;

        return (
          <button
            key={state.id}
            onClick={() => onChange(state.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#00ff00] text-black'
                : 'text-[#666] hover:text-white hover:bg-[#0d0d0d]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : ''}`} />
            {state.label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
