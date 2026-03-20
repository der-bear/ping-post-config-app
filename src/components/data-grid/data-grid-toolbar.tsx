import React, { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolbarActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  label: string
  variant?: 'default' | 'dropdown'
}

export const ToolbarAction = forwardRef<HTMLButtonElement, ToolbarActionProps>(
  ({ icon: Icon, label, variant = 'default', className, ...props }, ref) => (
    <Button
      ref={ref}
      data-slot="toolbar-action"
      variant="ghost"
      size="sm"
      className={cn('gap-1.5 px-2', className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {variant === 'dropdown' && <ChevronDown className="h-3 w-3 opacity-60" />}
    </Button>
  ),
)
ToolbarAction.displayName = 'ToolbarAction'

export function ToolbarSeparator() {
  return <div className="w-px h-5 bg-border mx-1" />
}

interface ToolbarProps {
  children: ReactNode
  className?: string
}

export function DataGridToolbar({ children, className }: ToolbarProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {children}
    </div>
  )
}
