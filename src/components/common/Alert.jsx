import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helpers";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Alert Component
 * Display success, error, warning, and info messages
 */
const alertVariants = cva("relative w-full rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      success:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400",
      error:
        "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400",
      warning:
        "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400",
      info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * @typedef {'default'|'success'|'error'|'warning'|'info'} AlertVariant
 *
 * @typedef {Object} AlertProps
 * @property {string} [className] - Additional class names
 * @property {AlertVariant} [variant] - Alert style variant
 * @property {string} [title] - Alert title
 * @property {React.ReactNode} [children] - Alert content
 */

/**
 * Alert component for displaying messages
 * @param {AlertProps} props
 * @param {React.Ref<HTMLDivElement>} ref
 */
const Alert = React.forwardRef(
  /**
   * @param {React.HTMLAttributes<HTMLDivElement> & {
   *   className?: string,
   *   variant?: 'default'|'success'|'error'|'warning'|'info',
   *   title?: string,
   *   children?: React.ReactNode
   * }} props
   * @param {React.ForwardedRef<HTMLDivElement>} ref
   */
  ({ className, variant = "default", title, children, ...props }, ref) => {
    const IconComponent = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      default: Info,
    }[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="ml-3">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {children && (
              <div className={cn("text-sm", title && "mt-2")}>{children}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert, alertVariants };
