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
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-all"
      >
        <Tag className="w-3 h-3" />
        <span>
          {selectedLabels.length === 0
            ? 'LABELS'
            : `[${selectedLabels.length}_LABELS_SELECTED]`}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-[#0d0d0d] border border-[#333] shadow-2xl">
          <div className="p-2 border-b border-[#333]">
            <input
              type="text"
              placeholder="filter_labels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto font-mono">
            {isLoading ? (
              <div className="px-3 py-4 text-xs text-[#666] text-center italic">
                loading_labels...
              </div>
            ) : filteredLabels.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#666] text-center italic">
                no_labels_found
              </div>
            ) : (
              filteredLabels.map((label) => {
                const isSelected = selectedLabels.includes(label.name);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div
                      className={`w-3.5 h-3.5 border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#00ff00] border-[#00ff00]'
                          : 'border-[#333]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-black font-black" />}
                    </div>
                    <span
                      className="w-2.5 h-2.5 border border-[#333] flex-shrink-0"
                      style={{ backgroundColor: `#${label.color}` }}
                    />
                    <span className={isSelected ? 'text-[#00ff00]' : 'text-[#888]'}>
                      {label.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedLabels.length > 0 && (
            <div className="p-2 border-t border-[#333]">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 text-[10px] text-[#666] hover:text-[#00ff00] transition-colors"
              >
                <X className="w-3 h-3" />
                CLEAR_SELECTION
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
