import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FlyoutPanelProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string
  className?: string
}

export function FlyoutPanel({
  open,
  onClose,
  title,
  children,
  footer,
  width = '480px',
  className,
}: FlyoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Trap focus
  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]',
      )
      firstFocusable?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full z-50 bg-card shadow-panel flex flex-col',
          className,
        )}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-panel-header text-primary-foreground rounded-t-none">
          <h2 className="text-[20px] leading-[28px] font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-white/20 h-8 w-8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
