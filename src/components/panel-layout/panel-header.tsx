import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PanelHeaderProps {
  title: string
  subtitle?: string
  isExpanded?: boolean
  onMaximize?: () => void
  onClose?: () => void
  className?: string
}

export function PanelHeader({ title, subtitle, isExpanded, onMaximize, onClose, className }: PanelHeaderProps) {
  const ExpandIcon = isExpanded ? Minimize2 : Maximize2

  return (
    <div data-slot="panel-header" className={cn('flex items-center justify-between px-5 py-3 bg-panel-header', className)}>
      <div>
        {subtitle && <p className="text-xs text-primary-foreground/70 leading-4">{subtitle}</p>}
        <h1 className="text-lg leading-6 font-semibold text-primary-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        {onMaximize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMaximize}
            className="h-8 w-8"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ExpandIcon className="h-4 w-4" />
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
