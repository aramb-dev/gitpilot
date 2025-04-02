import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helpers";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Toast Component
 * Notification component for providing feedback to users
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-md transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "bg-background border",
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
  }
);

const Toast = ({
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (duration) {
      const id = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow exit animation to play
      }, duration);
      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [duration, onClose]);

  const handleClose = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow exit animation to play
  };

  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    default: Info,
  }[variant];

  return (
    <div
      className={cn(
        toastVariants({ variant }),
        "relative transform transition-all duration-300 max-w-md",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Toast container that renders toasts using a portal
const ToastContainer = ({ toasts = [], removeToast }) => {
  return createPortal(
    <div className="fixed top-0 right-0 z-50 flex flex-col items-end gap-2 p-4 max-h-screen overflow-hidden pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export { Toast, ToastContainer };
