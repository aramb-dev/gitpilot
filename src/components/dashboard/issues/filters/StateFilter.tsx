'use client';

import { CheckCircle2, Circle, CircleDot, GitMerge } from 'lucide-react';

interface StateOption {
  value: string;
  label: string;
  color?: string;
  icon?: any;
}

interface StateFilterProps {
  value: string;
  onChange: (state: any) => void;
  options?: StateOption[];
}

const DEFAULT_OPTIONS: StateOption[] = [
  { value: 'open', label: 'Open', icon: CircleDot, color: 'text-green-500' },
  { value: 'closed', label: 'Closed', icon: CheckCircle2, color: 'text-purple-500' },
  { value: 'all', label: 'All', icon: Circle, color: 'text-gray-400' },
];

export function StateFilter({ value, onChange, options = DEFAULT_OPTIONS }: StateFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] p-1 font-mono">
      {options.map((state) => {
        const Icon = state.icon || Circle;
        const isActive = value === state.value;

        return (
          <button
            key={state.value}
            onClick={() => onChange(state.value)}
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
