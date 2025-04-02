import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helpers";
import { Lock, Unlock } from "lucide-react";

/**
 * Badge Component
 * Used to display repository status (public/private)
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = ({ className, variant, children, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
};

// Specialized badges for repository visibility
const PrivateBadge = () => (
  <Badge variant="warning" className="gap-1">
    <Lock className="h-3 w-3" />
    <span>Private</span>
  </Badge>
);

const PublicBadge = () => (
  <Badge variant="success" className="gap-1">
    <Unlock className="h-3 w-3" />
    <span>Public</span>
  </Badge>
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, PrivateBadge, PublicBadge };
