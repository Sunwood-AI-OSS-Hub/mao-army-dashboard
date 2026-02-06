import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-purple-900 text-purple-100 hover:bg-purple-800 shadow-lg shadow-purple-900/20',
        destructive: 'bg-red-900 text-red-100 hover:bg-red-800 shadow-lg shadow-red-900/20',
        outline: 'border border-purple-700/50 bg-transparent hover:bg-purple-900/20 text-purple-200',
        secondary: 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/30',
        ghost: 'hover:bg-purple-900/20 text-purple-200',
        link: 'text-purple-400 underline-offset-4 hover:underline',
        demon: 'bg-gradient-to-r from-purple-900 to-red-900 text-purple-100 hover:from-purple-800 hover:to-red-800 shadow-lg shadow-purple-900/30 border border-purple-700/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
