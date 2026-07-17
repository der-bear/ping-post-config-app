import { cn } from '@/lib/utils'

/**
 * Shared border/background states for interactive cards (radio SelectableCards and
 * button ChoiceCards) so hover, active (pressed), selected, and disabled render
 * identically everywhere.
 *
 * - hover: subtle light-gray fill
 * - active (pressed): blue, matching the selected look
 * - selected: blue
 * - disabled: muted, not-allowed
 */
export function interactiveCardStateClasses(selected: boolean, disabled: boolean) {
  return cn(
    'transition-all',
    selected && !disabled
      ? 'border-primary/50 bg-primary-light'
      : disabled
        ? 'border-border bg-muted/30 cursor-not-allowed'
        : 'border-border bg-background cursor-pointer hover:bg-accent active:border-primary/50 active:bg-primary-light',
  )
}
