import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectableCardProps {
  icon: ReactNode
  title: string
  description: string
  selected?: boolean
  disabled?: boolean
  compact?: boolean
  onClick?: () => void
  className?: string
}

function RadioIndicator({ selected, disabled }: { selected: boolean; disabled: boolean }) {
  return (
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
  )
}

export function SelectableCard({
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  compact = false,
  onClick,
  className,
}: SelectableCardProps) {
  const iconColor = disabled ? 'text-muted-foreground' : 'text-primary'

  // Compact: always horizontal (icon left, text center, radio right)
  if (compact) {
    return (
      <button
        type="button"
        data-slot="selectable-card"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'flex gap-3 items-start p-4 rounded border transition-all text-left',
          selected && !disabled
            ? 'border-primary/50 bg-primary-light'
            : disabled
              ? 'border-border bg-muted/30 cursor-not-allowed'
              : 'border-border bg-background cursor-pointer hover:border-primary/20 hover:bg-accent/5',
          className,
        )}
      >
        <div className={cn('shrink-0 size-6', iconColor)}>{icon}</div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className={cn('font-semibold text-sm leading-5', disabled ? 'text-muted-foreground' : 'text-foreground')}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground leading-4">{description}</p>
        </div>
        <RadioIndicator selected={selected} disabled={disabled} />
      </button>
    )
  }

  // Default: responsive (horizontal on mobile, vertical on lg+).
  // Let the parent grid/flex container stretch cards to equal height.
  return (
    <button
      type="button"
      data-slot="selectable-card"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-full gap-3 items-start p-4 rounded border transition-all text-left',
        'lg:flex-col lg:gap-4',
        selected && !disabled
          ? 'border-primary/50 bg-primary-light'
          : disabled
            ? 'border-border bg-muted/30 cursor-not-allowed'
            : 'border-border bg-background cursor-pointer hover:border-primary/20 hover:bg-accent/5',
        className,
      )}
    >
      {/* Mobile: Icon on left */}
      <div className={cn('shrink-0 size-6 lg:hidden', iconColor)}>{icon}</div>

      {/* Desktop: Icon and radio in row */}
      <div className="hidden lg:flex items-start justify-between w-full">
        <div className={cn('shrink-0 size-6', iconColor)}>{icon}</div>
        <RadioIndicator selected={selected} disabled={disabled} />
      </div>

      {/* Title and description */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className={cn('font-semibold text-sm leading-5', disabled ? 'text-muted-foreground' : 'text-foreground')}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground leading-4">{description}</p>
      </div>

      {/* Mobile: Radio on right */}
      <div className="lg:hidden">
        <RadioIndicator selected={selected} disabled={disabled} />
      </div>
    </button>
  )
}
