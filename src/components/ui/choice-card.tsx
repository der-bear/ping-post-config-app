import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { interactiveCardStateClasses } from './card-states'

interface ChoiceCardProps {
  icon: ReactNode
  title: string
  description: string
  /** Optional persistent highlight (e.g. the last choice when the user returns). */
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

/**
 * A large, centered, icon-on-top card that behaves as a button — for "how would you
 * like to…" choosers where clicking a card is the action (no radio, no separate Next).
 * Shares the design tokens and hover treatment of SelectableCard for consistency.
 */
export function ChoiceCard({
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      data-slot="choice-card"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-full flex-col items-center justify-center gap-2.5 rounded border p-5 text-center',
        interactiveCardStateClasses(selected, disabled),
        className,
      )}
    >
      <div className={cn('shrink-0', disabled ? 'text-muted-foreground' : 'text-primary')}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className={cn('text-sm font-semibold leading-5', disabled ? 'text-muted-foreground' : 'text-foreground')}>
          {title}
        </p>
        <p className="text-xs leading-4 text-text-medium">{description}</p>
      </div>
    </button>
  )
}
