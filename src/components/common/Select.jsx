import React from "react";
import { cn } from "../../utils/helpers";
import { ChevronDown } from "lucide-react";

/**
 * Select Component
 * Dropdown for repository filters
 */
const Select = React.forwardRef(
  (
    { className, children, error, placeholder, value, onChange, ...props },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          value={value}
          onChange={onChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
