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
  children,
  className,
}: SwitchFieldProps) {
  const id = useId()
  const [tipOpen, setTipOpen] = useState(false)

  const field = (
    <div
      data-slot="switch-field"
      className={cn('flex gap-4', disabled && 'opacity-60', className)}
      onMouseEnter={tooltip ? () => setTipOpen(true) : undefined}
      onMouseLeave={tooltip ? () => setTipOpen(false) : undefined}
    >
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
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

  if (!tooltip) return field

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={tipOpen} onOpenChange={setTipOpen}>
        {field}
        <TooltipContent side="bottom" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
