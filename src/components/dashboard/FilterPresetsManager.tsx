'use client';

import { useState } from 'react';
import { Save, X, Bookmark, Trash2, Check, Star } from 'lucide-react';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import type { PresetContext, FilterConfig } from '@/db/filter-presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FilterPresetsManagerProps {
  context: PresetContext;
  currentFilters: FilterConfig;
  onApplyPreset: (filters: FilterConfig) => void;
}

export function FilterPresetsManager({
  context,
  currentFilters,
  onApplyPreset,
}: FilterPresetsManagerProps) {
  const { presets, savePreset, deletePreset, updatePreset, isLoading } = useFilterPresets(context);
  const [presetName, setPresetName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSavePreset = async () => {
    if (!presetName) return;
    try {
      await savePreset(presetName, currentFilters);
      setPresetName('');
      setIsSaveDialogOpen(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleToggleDefault = async (id: string, isDefault: boolean) => {
    try {
      await updatePreset(id, { isDefault: !isDefault });
      toast.success(isDefault ? 'Removed as default' : 'Set as default');
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this preset?')) {
      try {
        await deletePreset(id);
      } catch (err) {
        // Error handled in hook
      }
    }
  };

  return (
    <div className="flex items-center gap-2 font-mono">
      {/* Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 bg-[#1a1a1a] border-[#333] text-[#888] hover:text-[#00ff00] hover:border-[#00ff00] font-mono"
            disabled={isLoading}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            {isLoading ? 'LOADING...' : 'PRESETS'}
            {presets.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[#333] text-white text-[10px]">
                {presets.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none">
          <div className="px-2 py-1.5 text-xs text-[#666] uppercase tracking-widest border-b border-[#333] mb-1">
            Saved Presets
          </div>
          {presets.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-[#444]">
              No presets found
            </div>
          ) : (
            presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => onApplyPreset(preset.filters)}
                className="flex items-center justify-between group focus:bg-[#00ff00]/10 focus:text-[#00ff00] cursor-pointer rounded-none py-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {preset.isDefault ? (
                    <Star className="w-3 h-3 text-[#00ff00] shrink-0" fill="currentColor" />
                  ) : (
                    <Bookmark className="w-3 h-3 text-[#444] shrink-0" />
                  )}
                  <span className="truncate">{preset.name.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDefault(preset.id, preset.isDefault);
                    }}
                    className={`p-1 hover:bg-[#333] ${preset.isDefault ? 'text-[#00ff00]' : 'text-[#666]'}`}
                    title={preset.isDefault ? "Unset as default" : "Set as default"}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, preset.id)}
                    className="p-1 text-red-900 hover:text-red-500 hover:bg-red-500/10"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator className="bg-[#333]" />
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-2 focus:bg-[#00ff00]/10 focus:text-[#00ff00] cursor-pointer rounded-none py-2"
              >
                <Save className="w-3 h-3" />
                <span>save_current_filters</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="bg-[#0d0d0d] border border-[#333] text-white font-mono rounded-none">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">// SAVE_FILTER_PRESET</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#666] uppercase tracking-widest">
                    Preset Name
                  </label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g. status_bugs"
                    className="bg-[#1a1a1a] border-[#333] text-white font-mono focus:ring-[#00ff00]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleSavePreset}
                  disabled={!presetName}
                  className="w-full bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold"
                >
                  CONFIRM_SAVE
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick presets (most recent or default) */}
      <div className="flex gap-2">
        {presets.filter(p => p.isDefault).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset.filters)}
            className="px-2 py-1 text-[10px] bg-[#0d0d0d] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] font-mono transition-all flex items-center gap-1"
          >
            <Star className="w-2.5 h-2.5" fill="currentColor" />
            {preset.name.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
