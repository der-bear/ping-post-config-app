import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface FieldGroupProps {
  label?: string
  description?: string
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
    <div data-slot="field-group" className={cn('flex flex-col gap-2', horizontal && 'flex-row items-center gap-4', className)}>
      {label && (
        <Label className={cn('block font-normal', horizontal && 'min-w-[140px] mb-0')}>
          {label}
          {required && <span className="text-muted-foreground ml-1 italic">(required)</span>}
        </Label>
      )}
      <div className={cn(horizontal && 'flex-1')}>
        {children}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
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
        'text-sm leading-5',
        icon && 'flex items-center gap-2',
      )}>
        {icon && <span className="shrink-0 size-5 text-primary">{icon}</span>}
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
