import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldGroupProps {
  label?: string
  description?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
  horizontal?: boolean
}

export function FieldGroup({
  label,
  description,
  required = false,
  children,
  className,
  horizontal = false,
}: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'flex flex-col gap-2',
        horizontal && 'flex-row items-center gap-4',
        className,
      )}
    >
      {(label || description) && (
        <div className={cn('flex flex-col gap-0.5', horizontal && 'min-w-[140px]')}>
          {label && (
            <div className="flex items-start gap-1">
              <span className="text-sm font-normal leading-5 text-foreground">{label}</span>
              {required && (
                <span className="text-sm font-normal leading-5 text-destructive" aria-hidden="true">*</span>
              )}
            </div>
          )}
          {description && (
            <p className="text-xs font-normal leading-4 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={cn(horizontal && 'flex-1')}>{children}</div>
    </div>
  )
}

interface SectionHeadingProps {
  title: string
  description?: string
  icon?: ReactNode
  className?: string
}

export function SectionHeading({ title, description, icon, className }: SectionHeadingProps) {
  return (
    <div data-slot="section-heading" className={cn('space-y-1', className)}>
      <h3 className={cn(
        'font-semibold text-foreground',
        'text-base leading-6',
        icon && 'flex items-center gap-3',
      )}>
        {icon && <span className="shrink-0 size-5 text-text-medium">{icon}</span>}
        {title}
      </h3>
      {description && (
        <p className="text-xs leading-4 text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
