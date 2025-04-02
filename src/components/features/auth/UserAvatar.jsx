import React from "react";
import { cn } from "../../../utils/helpers";
import { User } from "lucide-react";

/**
 * User Avatar component
 * Displays the user's GitHub profile image
 */
const UserAvatar = ({ user, size = "md", className, fallback = true }) => {
  const [imageError, setImageError] = React.useState(false);

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Handle image load error
  const handleError = () => {
    setImageError(true);
  };

  // If there's no user or image failed to load, show fallback
  if (!user?.photoURL || imageError) {
    if (!fallback) return null;

    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300",
          sizeClasses[size],
          className
        )}
      >
        <User className={size === "sm" ? "h-4 w-4" : "h-6 w-6"} />
      </div>
    );
  }

  // Show user avatar
  return (
    <img
      src={user.photoURL}
      alt={user.displayName || "User avatar"}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
      onError={handleError}
    />
  );
};

export default UserAvatar;
