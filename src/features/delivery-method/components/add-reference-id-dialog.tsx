import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddReferenceIdDialogProps {
  open: boolean
  onClose: () => void
  onSave: (deliveryFieldName: string) => void
}

export function AddReferenceIdDialog({ open, onClose, onSave }: AddReferenceIdDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [formKey, setFormKey] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormKey((k) => k + 1)
      setError('')
    }
  }, [open])

  const handleSave = useCallback(() => {
    const form = formRef.current
    if (!form) return
    const name = ((new FormData(form).get('name') as string) ?? '').trim()
    if (!name) {
      setError('Enter a field name')
      return
    }
    onSave(name)
    onClose()
  }, [onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden shadow-panel" showClose={false}>
        <DialogPanelHeader title="Add PING Reference ID" />
        <DialogDescription className="sr-only">
          Add a mapping for the buyer's PING reference ID.
        </DialogDescription>

        <form
          ref={formRef}
          key={formKey}
          className="px-4 py-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <FieldGroup
            label="Delivery Field Name"
            required
            description="Find this in your buyer's POST spec — it's what links the POST to its PING."
          >
            <Input
              name="name"
              placeholder="e.g. ping_id, ref_id, bid_token"
              autoFocus
              className={cn(error && 'border-destructive')}
              onChange={() => error && setError('')}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </FieldGroup>
        </form>

        <DialogFooter className="px-4 py-3 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Mapping</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
