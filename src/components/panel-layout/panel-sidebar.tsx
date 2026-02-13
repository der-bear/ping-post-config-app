import { useCallback, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  label: string
  active?: boolean
  onClick?: () => void
  indented?: boolean
}

export function NavItem({ label, active = false, onClick, indented = false }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left pr-3 h-auto text-sm leading-5 transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        indented
          ? 'pl-12 py-2'
          : 'pl-4 py-3 border-t border-border',
        active
          ? 'bg-sidebar-active text-sidebar-active-text border-l-[3px] border-l-sidebar-active'
          : 'text-muted-foreground hover:bg-sidebar-hover ',
      )}
    >
      {label}
    </button>
  )
}

interface NavGroupProps {
  label: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
  active?: boolean
}

export function NavGroup({ label, expanded, onToggle, children, active = false }: NavGroupProps) {
  const handleClick = useCallback(() => onToggle(), [onToggle])

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center justify-between pl-4 pr-3 py-3 h-auto text-sm leading-5 border-t border-border transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          active
            ? 'text-primary'
            : 'text-muted-foreground hover:bg-sidebar-hover ',
        )}
      >
        <span>{label}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div>{children}</div>}
    </div>
  )
}

interface PanelSidebarProps {
  children: ReactNode
  className?: string
}

export function PanelSidebar({ children, className }: PanelSidebarProps) {
  return (
    <nav className={cn('flex flex-col [&>*:first-child]:border-t-0 [&>*:first-child>button]:border-t-0', className)}>
      {children}
    </nav>
  )
}
