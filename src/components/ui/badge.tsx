import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-purple-700/50 bg-purple-900/50 text-purple-100',
        secondary: 'border-purple-600/30 bg-purple-950/50 text-purple-200',
        destructive: 'border-red-700/50 bg-red-900/50 text-red-100',
        outline: 'border-purple-700/50 text-purple-200',
        success: 'border-green-700/50 bg-green-900/50 text-green-100',
        warning: 'border-yellow-700/50 bg-yellow-900/50 text-yellow-100',
        active: 'border-green-500/50 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20',
        idle: 'border-blue-500/50 bg-blue-500/20 text-blue-400',
        busy: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20',
        offline: 'border-gray-500/50 bg-gray-500/20 text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
