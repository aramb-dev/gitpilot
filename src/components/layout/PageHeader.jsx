import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helpers";

/**
 * Page header component with title and optional actions
 */
const pageHeaderVariants = cva(
  "pb-5 mb-6 border-b border-slate-200 dark:border-slate-700",
  {
    variants: {
      variant: {
        default: "",
        compact: "pb-3 mb-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const PageHeader = ({
  title,
  description,
  actions,
  variant,
  className,
  ...props
}) => {
  return (
    <div className={cn(pageHeaderVariants({ variant }), className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
