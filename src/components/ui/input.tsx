import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[4px] border border-border border-b-2 border-b-border-strong bg-background px-3 pt-2.5 pb-2 text-sm leading-5 text-foreground transition-colors duration-75 hover:border-border-strong hover:border-b-2 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-subtle focus-visible:outline-none focus-visible:border-border focus-visible:border-b-ring disabled:cursor-not-allowed disabled:opacity-50',
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
