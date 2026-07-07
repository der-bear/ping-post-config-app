import { useCallback, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  label: string
  icon?: ReactNode
  active?: boolean
  onClick?: () => void
  indented?: boolean
  invalid?: boolean
  disabled?: boolean
}

function NavLabel({
  label,
  icon,
  invalid = false,
}: {
  label: string
  icon?: ReactNode
  invalid?: boolean
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        {icon && <span className="shrink-0 text-current">{icon}</span>}
        <span className="truncate">{label}</span>
      </span>
      {invalid && (
        <span
          className="size-1 rounded-full bg-destructive"
          aria-hidden="true"
        />
      )}
    </span>
  )
}

export function NavItem({
  label,
  icon,
  active = false,
  onClick,
  indented = false,
  invalid = false,
  disabled = false,
}: NavItemProps) {
  const paddingClass = indented
    ? active && !disabled ? 'pl-[37px]' : 'pl-10'
    : active && !disabled ? 'pl-[13px]' : 'pl-4'

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left pr-3 h-auto text-sm leading-5 transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        indented ? 'py-2' : 'py-3 border-t border-border',
        paddingClass,
        disabled
          ? 'cursor-not-allowed text-muted-foreground/50'
          : active
            ? 'bg-sidebar-active text-sidebar-active-text border-l-[3px] border-l-sidebar-active'
            : 'text-muted-foreground hover:bg-sidebar-hover',
      )}
    >
      <NavLabel label={label} icon={icon} invalid={invalid} />
    </button>
  )
}

interface NavGroupProps {
  label: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
  active?: boolean
  invalid?: boolean
  disabled?: boolean
}

export function NavGroup({
  label,
  expanded,
  onToggle,
  children,
  active = false,
  invalid = false,
  disabled = false,
}: NavGroupProps) {
  const handleClick = useCallback(() => onToggle(), [onToggle])

  return (
    <div>
      <button
        onClick={disabled ? undefined : handleClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between pl-4 pr-3 py-3 h-auto text-sm leading-5 border-t border-border transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          disabled
            ? 'cursor-not-allowed text-muted-foreground/50'
            : active
            ? 'text-primary hover:bg-sidebar-hover'
            : 'text-muted-foreground hover:bg-sidebar-hover',
        )}
      >
        <NavLabel label={label} invalid={invalid} />
        {expanded ? (
          <ChevronDown className={cn(
            'h-4 w-4',
            disabled ? 'text-muted-foreground/50' : 'text-muted-foreground',
          )} />
        ) : (
          <ChevronRight className={cn(
            'h-4 w-4',
            disabled ? 'text-muted-foreground/50' : 'text-muted-foreground',
          )} />
        )}
      </button>
      {expanded && !disabled && <div className="pb-2">{children}</div>}
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
