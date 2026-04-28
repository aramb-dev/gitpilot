'use client';

import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useSignOut } from '@/hooks/useSignOut';

export function AccountDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut, isSigningOut } = useSignOut();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 border border-transparent hover:border-[#333] hover:bg-[#1a1a1a] transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-8 h-8 border border-[#333]"
          />
        ) : (
          <div className="w-8 h-8 border border-[#333] bg-[#1a1a1a] flex items-center justify-center">
            <User className="w-4 h-4 text-[#666]" />
          </div>
        )}
        <ChevronDown
          className={`w-3 h-3 text-[#666] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-[#0d0d0d] border border-[#333] shadow-2xl z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#333] bg-[#0a0a0a]">
            <p className="text-sm font-bold text-white truncate uppercase tracking-tighter">
              {user.name || 'GITHUB_USER'}
            </p>
            {user.email && (
              <p className="text-[10px] text-[#666] truncate lowercase">{user.email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs text-[#888] hover:bg-[#1a1a1a] hover:text-[#00ff00] transition-colors uppercase"
            >
              <Settings className="w-3.5 h-3.5" />
              [settings]
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              disabled={isSigningOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#888] hover:bg-[#1a1a1a] hover:text-red-500 transition-colors disabled:opacity-50 uppercase text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isSigningOut ? 'executing_exit...' : '[sign_out]'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
