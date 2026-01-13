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
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-all"
      >
        <span>
          {selectedRepos.length === 0
            ? 'ALL_REPOSITORIES'
            : `[${selectedRepos.length}_REPOS_SELECTED]`}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-[#0d0d0d] border border-[#333] shadow-2xl">
          <div className="p-2 border-b border-[#333]">
            <input
              type="text"
              placeholder="filter_repos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredRepos.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#666] text-center italic">
                no_repos_found
              </div>
            ) : (
              filteredRepos.map((repo) => {
                const isSelected = selectedRepos.includes(repo);
                return (
                  <button
                    key={repo}
                    onClick={() => toggleRepo(repo)}
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
                    <span className={isSelected ? 'text-[#00ff00]' : 'text-[#888]'}>
                      {repo}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedRepos.length > 0 && (
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
