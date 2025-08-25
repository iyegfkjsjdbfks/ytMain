import React from 'react';

// Simple utility function for className merging;
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Button variant styles;
const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    ghost: "text-gray-700 hover:bg-gray-100",
    link: "text-blue-600 underline hover:text-blue-800",
  },
  size: {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClass = buttonVariants.variant[variant];
    const sizeClass = buttonVariants.size[size];
    
    return (
      <button;>
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus: outline-none focus: ring-2 focus: ring-offset-2 disabled: opacity-50 disabled: pointer-events-none",
          variantClass,
          sizeClass,
          className;
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
export default Button;