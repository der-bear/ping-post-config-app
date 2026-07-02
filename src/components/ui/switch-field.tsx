import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

interface SwitchFieldProps {
  label: string
  description?: ReactNode
  meta?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
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
  children,
  className,
}: SwitchFieldProps) {
  const id = useId()

  return (
    <div data-slot="switch-field" className={cn('flex gap-4', disabled && 'opacity-60', className)}>
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
            <p className="text-sm font-normal leading-5 text-foreground">{label}</p>
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
}
