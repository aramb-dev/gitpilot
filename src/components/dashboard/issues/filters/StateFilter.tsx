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
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {states.map((state) => {
        const Icon = state.icon;
        const isActive = value === state.id;

        return (
          <button
            key={state.id}
            onClick={() => onChange(state.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? state.color : ''}`} />
            {state.label}
          </button>
        );
      })}
    </div>
  );
}
