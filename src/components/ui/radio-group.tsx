import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// 20px click zone, 18px visual control (per Figma spec).
const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center bg-transparent transition-colors duration-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        '[&_[data-radio-visual]]:border-border-strong',
        'data-[state=checked]:[&_[data-radio-visual]]:border-[5px] data-[state=checked]:[&_[data-radio-visual]]:border-primary',
        className
      )}
      {...props}
    >
      <span
        data-radio-visual
        className="block size-[18px] rounded-full border bg-background transition-colors"
      />
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
