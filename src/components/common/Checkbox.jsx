import React from "react";
import { cn } from "../../utils/helpers";
import { Check } from "lucide-react";

/**
 * Checkbox Component
 * Used for selecting repositories in bulk operations
 */
const Checkbox = React.forwardRef(
  ({ className, checked, indeterminate = false, onChange, ...props }, ref) => {
    const innerRef = React.useRef(null);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleRef = (el) => {
      innerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          ref={handleRef}
          className="peer h-4 w-4 shrink-0 opacity-0 absolute"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 peer-checked:bg-primary peer-checked:text-primary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        >
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          {!checked && indeterminate && (
            <div className="h-3 w-3 flex items-center justify-center">
              <div className="h-0.5 w-2 bg-primary"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
