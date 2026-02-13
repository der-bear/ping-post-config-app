import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelFooterProps {
  leftActions?: ReactNode
  rightActions?: ReactNode
  className?: string
}

export function PanelFooter({ leftActions, rightActions, className }: PanelFooterProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-border bg-sidebar-bg', className)}>
      <div className="flex items-center gap-2">
        {leftActions}
      </div>
      <div className="flex items-center gap-2">
        {rightActions}
      </div>
    </div>
  )
}
