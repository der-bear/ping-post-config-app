import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  className?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  className,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-slot="confirm-dialog"
        className={cn("max-w-[480px] p-0 gap-0 overflow-hidden shadow-panel", className)}
        showClose={false}
      >
        <DialogPanelHeader title={title} />
        <DialogDescription className="sr-only">{description}</DialogDescription>

        <div className="px-4 py-6 text-sm text-foreground">{description}</div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
