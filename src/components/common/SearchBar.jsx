import React, { useState, useEffect } from "react";
import { cn } from "../../utils/helpers";
import { Search, X } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { useDebounce } from "../../hooks/useDebounce";

/**
 * SearchBar Component
 * Repository search functionality with debouncing
 */
const SearchBar = ({
  onSearch,
  placeholder = "Search repositories...",
  className,
  initialValue = "",
  debounceMs = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // When debounced search term changes, trigger the search
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>

      <Input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />

      {searchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-5 w-5 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export { SearchBar };
