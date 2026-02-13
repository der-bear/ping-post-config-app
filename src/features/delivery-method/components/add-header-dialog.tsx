import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/field-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CustomHeader } from '@/features/delivery-method/types'

interface AddHeaderDialogProps {
  open: boolean
  onClose: () => void
  onSave: (header: CustomHeader) => void
  editData?: CustomHeader | null
}

export function AddHeaderDialog({ open, onClose, onSave, editData }: AddHeaderDialogProps) {
  const isEditing = editData !== null && editData !== undefined
  const formRef = useRef<HTMLFormElement>(null)
  const [formKey, setFormKey] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormKey((k) => k + 1)
       
      setErrors({})
    }
  }, [open, editData])

  const handleSave = useCallback(() => {
    const form = formRef.current
    if (!form) return

    const fd = new FormData(form)
    const name = (fd.get('name') as string)?.trim() ?? ''
    const value = (fd.get('value') as string)?.trim() ?? ''

    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Enter name'
    if (!value) newErrors.value = 'Enter value'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: isEditing && editData ? editData.id : `header-${Date.now()}`,
      name,
      value,
    })
    onClose()
  }, [isEditing, editData, onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.1)]"
        showClose={false}
      >
        <DialogPanelHeader title={isEditing ? 'Edit Custom Header' : 'Add Custom Header'} />
        <DialogDescription className="sr-only">
          {isEditing ? 'Edit an existing custom header' : 'Add a new custom header'}
        </DialogDescription>

        <form
          ref={formRef}
          key={formKey}
          className="px-4 py-4 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <FieldGroup label="Name" required>
            <Input
              name="name"
              defaultValue={editData?.name ?? ''}
              placeholder="e.g. X-Custom-Header"
              className={cn(errors.name && 'border-destructive')}
              onChange={() => errors.name && setErrors((prev) => ({ ...prev, name: '' }))}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </FieldGroup>

          <FieldGroup label="Value" required>
            <Input
              name="value"
              defaultValue={editData?.value ?? ''}
              placeholder="Header value"
              className={cn(errors.value && 'border-destructive')}
              onChange={() => errors.value && setErrors((prev) => ({ ...prev, value: '' }))}
            />
            {errors.value && (
              <p className="text-xs text-destructive mt-1">{errors.value}</p>
            )}
          </FieldGroup>
        </form>

        <DialogFooter className="px-4 py-3 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
