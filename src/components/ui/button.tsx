import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'default', 
  ref,
  ...props 
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        {
          // Default variant - Primary color
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow': variant === 'default',
          // Outline variant
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          // Ghost variant
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          // Secondary variant
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          // Destructive variant
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm': variant === 'destructive',
          // Link variant
          'text-primary underline-offset-4 hover:underline': variant === 'link',
        },
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 px-3 text-xs': size === 'sm',
          'h-11 px-8 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
