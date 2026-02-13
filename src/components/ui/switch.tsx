import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'group peer relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-[4px] border transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=unchecked]:bg-white data-[state=unchecked]:border-border-strong',
      className
    )}
    {...props}
    ref={ref}
  >
    {/* "I" indicator – visible when checked */}
    <span className="absolute left-[11px] top-1/2 -translate-y-1/2 h-[8px] w-[2px] rounded-[1px] bg-white opacity-0 transition-opacity duration-75 group-data-[state=checked]:opacity-100" />
    {/* "O" indicator – visible when unchecked */}
    <span className="absolute right-[8px] top-1/2 -translate-y-1/2 size-[8px] rounded-full border-[1.5px] border-border-strong opacity-0 transition-opacity duration-75 group-data-[state=unchecked]:opacity-100" />
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-[20px] w-[20px] rounded-[2px] ring-0 transition-transform duration-75 data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-[4px] data-[state=checked]:bg-white data-[state=unchecked]:bg-white data-[state=unchecked]:border data-[state=unchecked]:border-border-strong'
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
