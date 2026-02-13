import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MethodSelectorCardProps {
  icon: ReactNode
  title: string
  description: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function MethodSelectorCard({
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  className,
}: MethodSelectorCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex gap-3 items-start p-4 rounded border transition-all text-left',
        'lg:flex-col lg:gap-4 lg:h-[160px]',
        selected && !disabled
          ? 'border-[rgba(73,139,255,0.2)] bg-gradient-to-r from-[#f9fbff] to-[#f9fbff]'
          : disabled
            ? 'border-border bg-muted/30 cursor-not-allowed'
            : 'border-border bg-background cursor-pointer hover:border-primary/20 hover:bg-accent/5',
        className,
      )}
    >
      {/* Mobile: Icon on left */}
      <div className={cn('shrink-0 size-6 lg:hidden', disabled ? 'text-muted-foreground' : 'text-primary')}>
        {icon}
      </div>

      {/* Desktop: Icon and radio in row */}
      <div className="hidden lg:flex items-start justify-between w-full">
        <div className={cn('shrink-0 size-6', disabled ? 'text-muted-foreground' : 'text-primary')}>
          {icon}
        </div>
        <div className="relative shrink-0 size-5">
          {selected && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-5 rounded-full border-[6px] border-primary bg-background" />
            </div>
          )}
          {!selected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-[18px] rounded-full border border-border" />
            </div>
          )}
        </div>
      </div>

      {/* Title and description */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className={cn('font-semibold text-sm leading-5', disabled ? 'text-muted-foreground' : 'text-foreground')}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground leading-4">{description}</p>
      </div>

      {/* Mobile: Radio on right */}
      <div className="relative shrink-0 size-5 lg:hidden">
        {selected && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-5 rounded-full border-[6px] border-primary bg-background" />
          </div>
        )}
        {!selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-[18px] rounded-full border border-border" />
          </div>
        )}
      </div>
    </button>
  )
}
