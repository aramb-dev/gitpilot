'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface RepoFilterProps {
  availableRepos: string[];
  selectedRepos: string[];
  onChange: (repos: string[]) => void;
}

export function RepoFilter({
  availableRepos,
  selectedRepos,
  onChange,
}: RepoFilterProps) {
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

  const filteredRepos = availableRepos.filter((repo) =>
    repo.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRepo = (repo: string) => {
    if (selectedRepos.includes(repo)) {
      onChange(selectedRepos.filter((r) => r !== repo));
    } else {
      onChange([...selectedRepos, repo]);
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
        <span>
          {selectedRepos.length === 0
            ? 'All repositories'
            : `${selectedRepos.length} repo${selectedRepos.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl">
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              placeholder="Filter repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredRepos.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No repositories found
              </div>
            ) : (
              filteredRepos.map((repo) => {
                const isSelected = selectedRepos.includes(repo);
                return (
                  <button
                    key={repo}
                    onClick={() => toggleRepo(repo)}
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
                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                      {repo}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedRepos.length > 0 && (
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
