import React from "react";
import { cn } from "../../utils/helpers";

/**
 * Card Component
 * Container for repository items and other content
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional class name for styling
 * @param {React.ForwardedRef<HTMLDivElement>} ref - Forwarded ref
 */
// @ts-ignore
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardHeader Component
 * @param {React.HTMLAttributes<HTMLDivElement> & {className?: string}} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
// @ts-ignore
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle Component
 * @param {React.HTMLAttributes<HTMLHeadingElement> & {className?: string}} props
 * @param {React.ForwardedRef<HTMLHeadingElement>} ref
 */
// @ts-ignore
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription Component
 * @param {React.HTMLAttributes<HTMLParagraphElement> & {className?: string}} props
 * @param {React.ForwardedRef<HTMLParagraphElement>} ref
 */
// @ts-ignore
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent Component
 * @param {React.HTMLAttributes<HTMLDivElement> & {className?: string}} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
// @ts-ignore
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter Component
 * @param {React.HTMLAttributes<HTMLDivElement> & {className?: string}} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
// @ts-ignore
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
