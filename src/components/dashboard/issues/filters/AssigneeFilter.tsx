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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors"
      >
        {selectedUser ? (
          <>
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.login}
              className="w-4 h-4 rounded-full"
            />
            <span>{selectedUser.login}</span>
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            <span>Assignee</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl">
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              placeholder="Filter users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Special options */}
            <button
              onClick={() => selectAssignee(null)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedAssignee === null
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedAssignee === null && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={selectedAssignee === null ? 'text-white' : 'text-gray-400'}>
                Anyone
              </span>
            </button>

            <button
              onClick={() => selectAssignee('none')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedAssignee === 'none'
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedAssignee === 'none' && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={selectedAssignee === 'none' ? 'text-white' : 'text-gray-400'}>
                No assignee
              </span>
            </button>

            <div className="border-t border-gray-800 my-1" />

            {isLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Loading users...
              </div>
            ) : filteredAssignees.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No users found
              </div>
            ) : (
              filteredAssignees.map((user) => {
                const isSelected = selectedAssignee === user.login;
                return (
                  <button
                    key={user.id}
                    onClick={() => selectAssignee(user.login)}
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
                    <img
                      src={user.avatarUrl}
                      alt={user.login}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                      {user.login}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedAssignee && selectedAssignee !== 'none' && (
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={() => selectAssignee(null)}
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
