import { useId, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SwitchFieldProps {
  label: string
  description?: ReactNode
  meta?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** When set, an info icon appears next to the label. Hovering anywhere on the
   *  field opens the tooltip, which is anchored to (and points at) the icon. */
  tooltip?: ReactNode
  /** Explains why the toggle is locked. Shown on hover over the toggle itself while
   *  `disabled`, with no info icon — the control being explained is the anchor. */
  lockedTooltip?: ReactNode
  children?: ReactNode
  className?: string
}

export function SwitchField({
  label,
  description,
  meta,
  checked,
  onCheckedChange,
  disabled,
  tooltip,
  lockedTooltip,
  children,
  className,
}: SwitchFieldProps) {
  const id = useId()
  const [tipOpen, setTipOpen] = useState(false)
  const showLockedTooltip = Boolean(disabled && lockedTooltip)

  // `disabled` dims only the toggle itself. The label stays legible and `children` stay
  // usable, so a locked switch can still expose an editable control (e.g. a policy
  // dropdown that remains the user's to choose).
  const switchEl = (
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(disabled && 'opacity-60')}
    />
  )

  const field = (
    <div
      data-slot="switch-field"
      className={cn('flex gap-4', className)}
      onMouseEnter={tooltip ? () => setTipOpen(true) : undefined}
      onMouseLeave={tooltip ? () => setTipOpen(false) : undefined}
    >
      {showLockedTooltip ? (
        // A disabled <button> fires no pointer events, so the hover target has to be a
        // wrapper around it rather than the Switch itself.
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0 self-start">{switchEl}</span>
        </TooltipTrigger>
      ) : (
        switchEl
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <label
          htmlFor={id}
          className={cn(
            'flex items-start justify-between gap-2',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <p className="text-sm font-normal leading-5 text-foreground">{label}</p>
              {tooltip && (
                <TooltipTrigger asChild>
                  <span className="inline-flex shrink-0 text-muted-foreground">
                    <Info className="size-3" />
                  </span>
                </TooltipTrigger>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {meta && (
            <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
          )}
        </label>
        {children && (
          <div className={cn(!checked && 'pointer-events-none opacity-50')}>
            {children}
          </div>
        )}
      </div>
    </div>
  )

  // Locked state wins: the toggle is the thing being explained, so it anchors the
  // tooltip and Radix drives the hover off it directly.
  if (showLockedTooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          {field}
          <TooltipContent side="top" align="start" className="max-w-[280px]">
            {lockedTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!tooltip) return field

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={tipOpen} onOpenChange={setTipOpen}>
        {field}
        <TooltipContent side="top" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
