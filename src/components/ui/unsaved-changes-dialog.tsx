import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface UnsavedChangesDialogProps {
  open: boolean
  onCancel: () => void
  onDiscard: () => void
  onSave: () => void
  isSaving?: boolean
}

export function UnsavedChangesDialog({
  open,
  onCancel,
  onDiscard,
  onSave,
  isSaving = false,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isSaving && !open) {
          onCancel()
        }
      }}
    >
      <DialogContent
        className="max-w-[480px] p-0 gap-0 overflow-hidden shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.1)]"
        showClose={false}
        onPointerDownOutside={(e) => isSaving && e.preventDefault()}
      >
        <DialogPanelHeader title="You have unsaved changes" />
        <DialogDescription className="sr-only">
          You have unsaved changes that will be lost if you continue
        </DialogDescription>

        <div className="px-4 py-6 text-sm text-foreground">
          You have unsaved changes that will be lost if you continue. Do you want to save your changes before closing?
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button variant="destructive" onClick={onDiscard} disabled={isSaving}>
            Discard
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save and Apply'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
