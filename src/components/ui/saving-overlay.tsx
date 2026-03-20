import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SavingOverlayProps {
  open: boolean
  message?: string
  className?: string
}

/**
 * Overlay with loading spinner for save operations
 * Scoped to parent container (use within panel body)
 */
export function SavingOverlay({ open, message = 'Saving...', className }: SavingOverlayProps) {
  if (!open) return null

  return (
    <div
      data-slot="saving-overlay"
      className={cn(
        'absolute inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'flex items-center justify-center',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  )
}
