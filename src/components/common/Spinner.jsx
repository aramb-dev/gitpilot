import React from "react";
import { cn } from "../../utils/helpers";

/**
 * Spinner Component
 * Loading indicator for async operations
 */
const Spinner = ({ className, size = "default", ...props }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading spinner with overlay
export const PageSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80">
      <Spinner size="xl" className="text-primary" />
      {message && (
        <p className="mt-4 text-lg text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

// Inline spinner that preserves layout
export const InlineSpinner = ({ className, size = "default", ...props }) => {
  return (
    <div className="flex justify-center items-center">
      <Spinner size={size} className={className} {...props} />
    </div>
  );
};

export { Spinner };
