'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Tag } from 'lucide-react';
import type { IssueLabel } from '@/types/issue';

interface LabelFilterProps {
  availableLabels: IssueLabel[];
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
  isLoading?: boolean;
}

export function LabelFilter({
  availableLabels,
  selectedLabels,
  onChange,
  isLoading = false,
}: LabelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLabels = availableLabels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onChange(selectedLabels.filter((l) => l !== labelName));
    } else {
      onChange([...selectedLabels, labelName]);
    }
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors"
      >
        <Tag className="w-4 h-4" />
        <span>
          {selectedLabels.length === 0
            ? 'Labels'
            : `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl">
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              placeholder="Filter labels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Loading labels...
              </div>
            ) : filteredLabels.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No labels found
              </div>
            ) : (
              filteredLabels.map((label) => {
                const isSelected = selectedLabels.includes(label.name);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `#${label.color}` }}
                    />
                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                      {label.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedLabels.length > 0 && (
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
