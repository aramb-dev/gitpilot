import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "../../common/Input";
import { Select } from "../../common/Select";
import { Button } from "../../common/Button";
import { useDebounce } from "../../../hooks/useDebounce";
import { Badge } from "../../common/Badge";

const RepositoryFilters = ({ filters, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  // Use debounce to avoid excessive filtering while typing
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update filter when debounced search changes
  React.useEffect(() => {
    onFilterChange("search", debouncedSearch);
  }, [debouncedSearch, onFilterChange]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onFilterChange("search", "");
  };

  const resetFilters = () => {
    setSearchQuery("");
    onFilterChange("visibility", "all");
    onFilterChange("owner", "all");
    onFilterChange("type", "all");
    onFilterChange("search", "");
  };

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" && value) return true;
    if (key !== "search" && value !== "all") return true;
    return false;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter dropdown section */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.visibility}
            onChange={(e) => onFilterChange("visibility", e.target.value)}
            className="w-full md:w-auto"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>

          <Select
            value={filters.owner}
            onChange={(e) => onFilterChange("owner", e.target.value)}
            className="w-full md:w-auto"
          >
            <option value="all">All Owners</option>
            <option value="user">Personal</option>
            <option value="org">Organization</option>
          </Select>

          <Select
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
            className="w-full md:w-auto"
          >
            <option value="all">All Types</option>
            <option value="sources">Sources</option>
            <option value="forks">Forks</option>
            <option value="archived">Archived</option>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryFilters;
