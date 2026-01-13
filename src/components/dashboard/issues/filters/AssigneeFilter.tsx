'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, User } from 'lucide-react';
import type { IssueUser } from '@/types/issue';

interface AssigneeFilterProps {
  availableAssignees: IssueUser[];
  selectedAssignee: string | null;
  onChange: (assignee: string | null) => void;
  isLoading?: boolean;
}

export function AssigneeFilter({
  availableAssignees,
  selectedAssignee,
  onChange,
  isLoading = false,
}: AssigneeFilterProps) {
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

  const filteredAssignees = availableAssignees.filter((user) =>
    user.login.toLowerCase().includes(search.toLowerCase())
  );

  const selectAssignee = (login: string | null) => {
    onChange(login);
    setIsOpen(false);
  };

  const selectedUser = availableAssignees.find((u) => u.login === selectedAssignee);

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] hover:border-[#00ff00] hover:text-[#00ff00] transition-all"
      >
        {selectedUser ? (
          <>
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.login}
              className="w-3.5 h-3.5 border border-[#333]"
            />
            <span>{selectedUser.login}</span>
          </>
        ) : (
          <>
            <User className="w-3.5 h-3.5" />
            <span>ASSIGNEE</span>
          </>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-[#0d0d0d] border border-[#333] shadow-2xl">
          <div className="p-2 border-b border-[#333]">
            <input
              type="text"
              placeholder="filter_users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] text-xs text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00ff00]"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Special options */}
            <button
              onClick={() => selectAssignee(null)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#1a1a1a] transition-colors"
            >
              <div
                className={`w-3.5 h-3.5 border flex items-center justify-center ${
                  selectedAssignee === null
                    ? 'bg-[#00ff00] border-[#00ff00]'
                    : 'border-[#333]'
                }`}
              >
                {selectedAssignee === null && <Check className="w-2.5 h-2.5 text-black font-black" />}
              </div>
              <span className={selectedAssignee === null ? 'text-[#00ff00]' : 'text-[#888]'}>
                ANYONE
              </span>
            </button>

            <button
              onClick={() => selectAssignee('none')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[#1a1a1a] transition-colors"
            >
              <div
                className={`w-3.5 h-3.5 border flex items-center justify-center ${
                  selectedAssignee === 'none'
                    ? 'bg-[#00ff00] border-[#00ff00]'
                    : 'border-[#333]'
                }`}
              >
                {selectedAssignee === 'none' && <Check className="w-2.5 h-2.5 text-black font-black" />}
              </div>
              <span className={selectedAssignee === 'none' ? 'text-[#00ff00]' : 'text-[#888]'}>
                NO_ASSIGNEE
              </span>
            </button>

            <div className="border-t border-[#333] my-1" />

            {isLoading ? (
              <div className="px-3 py-4 text-xs text-[#666] text-center italic">
                loading_users...
              </div>
            ) : filteredAssignees.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#666] text-center italic">
                no_users_found
              </div>
            ) : (
              filteredAssignees.map((user) => {
                const isSelected = selectedAssignee === user.login;
                return (
                  <button
                    key={user.id}
                    onClick={() => selectAssignee(user.login)}
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
                    <img
                      src={user.avatarUrl}
                      alt={user.login}
                      className="w-4 h-4 border border-[#333]"
                    />
                    <span className={isSelected ? 'text-[#00ff00]' : 'text-[#888]'}>
                      {user.login}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedAssignee && selectedAssignee !== 'none' && (
            <div className="p-2 border-t border-[#333]">
              <button
                onClick={() => selectAssignee(null)}
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
