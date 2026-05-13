import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

// 20px click zone, 16px visual control (per Figma spec).
const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-5 w-5 shrink-0 items-center justify-center bg-transparent transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      '[&_[data-checkbox-visual]]:border-border-strong [&_[data-checkbox-visual]]:bg-background',
      'data-[state=checked]:[&_[data-checkbox-visual]]:bg-primary data-[state=checked]:[&_[data-checkbox-visual]]:border-primary',
      className
    )}
    {...props}
  >
    <span
      data-checkbox-visual
      className="flex h-4 w-4 items-center justify-center rounded-sm border text-primary-foreground transition-colors"
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </span>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
