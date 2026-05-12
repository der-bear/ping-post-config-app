import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[4px] border border-border-strong bg-background px-3 py-2.5 text-sm leading-5 text-foreground transition-shadow duration-75 shadow-[inset_0_-1px_0_0_var(--color-input-emphasis)] hover:shadow-[inset_0_-2px_0_0_var(--color-input-emphasis)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[inset_0_-2px_0_0_var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
