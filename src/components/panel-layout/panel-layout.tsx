import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelLayoutProps {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
  footer: ReactNode
  className?: string
}

export function PanelLayout({ sidebar, header, children, footer, className }: PanelLayoutProps) {
  return (
    <div className={cn('flex h-full shadow-[0px_16px_32px_0px_rgba(0,0,0,0.1)] rounded-[4px] overflow-hidden', className)}>
      {/* Sidebar — no independent scroll; page scrolls if sidebar overflows */}
      <div className="w-[216px] min-w-[216px] shrink-0 border-r border-border bg-sidebar-bg">
        {sidebar}
      </div>

      {/* Main content area — stretches to sidebar height, content scrolls */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {header}
        <div className="relative flex-1 overflow-y-auto min-h-0 bg-background px-4 pt-4 pb-4">
          {children}
        </div>
        {footer}
      </div>
    </div>
  )
}
