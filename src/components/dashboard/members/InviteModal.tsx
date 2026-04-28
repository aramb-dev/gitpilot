'use client';

import { Mail, Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emailOrUsername: string, role: 'admin' | 'direct_member') => void;
  isLoading?: boolean;
}

export function InviteModal({ isOpen, onClose, onInvite, isLoading = false }: InviteModalProps) {
  const [target, setTarget] = useState('');
  const [role, setRole] = useState<'admin' | 'direct_member'>('direct_member');

  const handleInvite = () => {
    if (!target) return;
    onInvite(target, role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00ff00]" />
            // INVITE_TO_ORGANIZATION
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-xs text-[#666] uppercase tracking-widest block">
              GitHub Username or Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="username or email..."
                className="pl-10 bg-[#1a1a1a] border border-[#333] text-white font-mono placeholder-[#444] focus:ring-[#00ff00] rounded-none h-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-[#666] uppercase tracking-widest block">
              Organization Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRole('direct_member')}
                className={`px-3 py-3 text-xs border transition-all flex flex-col items-center gap-2 ${
                  role === 'direct_member'
                    ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]'
                    : 'bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#444]'
                }`}
              >
                <span className="font-bold">MEMBER</span>
                <span className="text-[9px] opacity-60">Can see all members and teams</span>
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-3 text-xs border transition-all flex flex-col items-center gap-2 ${
                  role === 'admin'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                    : 'bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#444]'
                }`}
              >
                <span className="font-bold uppercase">Owner / Admin</span>
                <span className="text-[9px] opacity-60">Full administrative access</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/20 text-[10px] text-blue-300 leading-relaxed">
            <Shield className="w-3 h-3 mb-1" />
            Invitation will be sent via email. If the user already has a GitHub account, they will
            also see it in their notifications.
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#0d0d0d] border-[#333] text-[#888] hover:text-white hover:border-[#444] font-mono rounded-none"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isLoading || !target}
              className="flex-1 bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold rounded-none"
            >
              {isLoading ? 'SENDING...' : 'SEND_INVITATION'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
