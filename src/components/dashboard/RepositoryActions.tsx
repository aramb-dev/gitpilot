import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RepositoryActionsProps {
  hasSelectedRepos: boolean;
  visibilityLabel: string;
  onToggleVisibility: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onSearch: (query: string) => void;
  visibilityFilter: string;
  onVisibilityChange: (value: string) => void;
  languageFilter: string;
  onLanguageChange: (value: string) => void;
  languages: string[];
  sortValue: string;
  onSortChange: (value: string) => void;
  presets?: React.ReactNode;
}

export function RepositoryActions({
  hasSelectedRepos,
  visibilityLabel,
  onToggleVisibility,
  onArchive,
  onUnarchive,
  onDelete,
  onSearch,
  visibilityFilter,
  onVisibilityChange,
  languageFilter,
  onLanguageChange,
  languages,
  sortValue,
  onSortChange,
  presets,
}: RepositoryActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 font-mono">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666] w-4 h-4" />
        <Input
          type="search"
          placeholder="search..."
          className="bg-[#1a1a1a] border-[#333] pl-10 w-64 focus:ring-[#00ff00] text-sm h-9 text-[#888] placeholder:text-[#666]"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <select
        value={visibilityFilter}
        onChange={(e) => onVisibilityChange(e.target.value)}
        className="bg-[#1a1a1a] text-[#888] border border-[#333] px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#00ff00] outline-none transition-all hover:border-[#00ff00] cursor-pointer font-mono h-9"
      >
        <option value="all">all_visibility</option>
        <option value="public">public</option>
        <option value="private">private</option>
      </select>

      <select
        value={languageFilter}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-[#1a1a1a] text-[#888] border border-[#333] px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#00ff00] outline-none transition-all hover:border-[#00ff00] cursor-pointer font-mono h-9"
      >
        <option value="all">all_languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <select
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-[#1a1a1a] text-[#888] border border-[#333] px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#00ff00] outline-none transition-all hover:border-[#00ff00] cursor-pointer font-mono h-9"
      >
        <option value="updated">last_updated</option>
        <option value="name">name_asc</option>
        <option value="stars">stars_count</option>
        <option value="created">created_at</option>
      </select>

      {presets && (
        <div className="flex items-center gap-2 border-l border-[#333] pl-2">{presets}</div>
      )}

      <div className="flex items-center gap-2 ml-2 border-l border-[#333] pl-2">
        <Button
          variant="outline"
          disabled={!hasSelectedRepos}
          onClick={onToggleVisibility}
          className="bg-[#1a1a1a] text-[#00ff00] border-[#333] hover:bg-[#00ff00]/10 hover:border-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
        >
          {visibilityLabel}
        </Button>
        <Button
          variant="outline"
          disabled={!hasSelectedRepos}
          onClick={onArchive}
          className="bg-[#1a1a1a] text-[#888] border-[#333] hover:bg-[#1a1a1a] hover:border-[#00ff00] hover:text-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
          title="Archive selected repositories"
        >
          archive
        </Button>
        <Button
          variant="outline"
          disabled={!hasSelectedRepos}
          onClick={onUnarchive}
          className="bg-[#1a1a1a] text-[#888] border-[#333] hover:bg-[#1a1a1a] hover:border-[#00ff00] hover:text-[#00ff00] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
          title="Unarchive selected repositories"
        >
          unarchive
        </Button>
        <Button
          variant="outline"
          disabled={!hasSelectedRepos}
          onClick={onDelete}
          className="bg-[#1a1a1a] text-red-500 border-[#333] hover:bg-red-500/10 hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-sm h-9"
        >
          delete
        </Button>
      </div>
    </div>
  );
}
