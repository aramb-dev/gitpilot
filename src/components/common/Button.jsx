import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/helpers";

/**
 * Button Component
 * Reusable button with different variants (primary, secondary, danger)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/**
 * @typedef {Object} ButtonProps
 * @property {string} [className] - Additional class names
 * @property {'primary'|'secondary'|'outline'|'ghost'|'danger'|'link'} [variant] - Button variant
 * @property {'default'|'sm'|'lg'|'icon'} [size] - Button size
 * @property {'button'|'submit'|'reset'} [type] - Button type attribute
 * @property {React.ReactNode} [children] - Button content
 */

/**
 * Button component for GitPilot
 * @type {React.ForwardRefExoticComponent<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>}
 */
const Button = React.forwardRef(
  /**
   * @param {ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>} props
   * @param {React.ForwardedRef<HTMLButtonElement>} ref
   */
  (props, ref) => {
    const { className, variant, size, type = "button", ...rest } = props;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
