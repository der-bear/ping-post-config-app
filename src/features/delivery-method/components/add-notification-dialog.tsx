import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/field-group'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { YesNoSelect } from '@/components/ui/yes-no-select'
import { cn } from '@/lib/utils'
import type { NotificationRecipient } from '@/features/delivery-method/types'

const USERS = [
  { value: 'kety-watford', label: 'Kety Watford' },
  { value: 'joe-doe', label: 'Joe Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'john-jones', label: 'John Jones' },
]

interface AddNotificationDialogProps {
  open: boolean
  onClose: () => void
  onSave: (recipients: NotificationRecipient[]) => void
}

export function AddNotificationDialog({ open, onClose, onSave }: AddNotificationDialogProps) {
  const [user, setUser] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setUser('') // eslint-disable-line react-hooks/set-state-in-effect
      setEmailEnabled(true)
      setSmsEnabled(false)
      setErrors({})
    }
  }, [open])

  const handleSave = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!user) newErrors.user = 'Select user'
    if (!emailEnabled && !smsEnabled) newErrors.channel = 'Select at least one notification channel'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const userLabel = USERS.find((u) => u.value === user)?.label ?? user
    const recipients: NotificationRecipient[] = []

    if (emailEnabled) {
      recipients.push({
        id: `notif-email-${Date.now()}`,
        user: userLabel,
        type: 'email',
      })
    }
    if (smsEnabled) {
      recipients.push({
        id: `notif-sms-${Date.now()}`,
        user: userLabel,
        type: 'sms',
      })
    }

    onSave(recipients)
    onClose()
  }, [user, emailEnabled, smsEnabled, onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.1)]"
        showClose={false}
      >
        <DialogPanelHeader title="Add Notification Recipient" />
        <DialogDescription className="sr-only">
          Add a new notification recipient
        </DialogDescription>

        <div className="p-5 space-y-5">
          <FieldGroup label="User" required>
            <Select
              value={user}
              onValueChange={(v) => {
                setUser(v)
                if (errors.user) setErrors((prev) => ({ ...prev, user: '' }))
              }}
            >
              <SelectTrigger className={cn(errors.user && 'border-destructive')}>
                <SelectValue placeholder="-- Select User --" />
              </SelectTrigger>
              <SelectContent>
                {USERS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user && (
              <p className="text-xs text-destructive mt-1">{errors.user}</p>
            )}
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Email">
              <YesNoSelect
                value={emailEnabled}
                onValueChange={setEmailEnabled}
              />
            </FieldGroup>
            <FieldGroup label="SMS Text¹">
              <YesNoSelect
                value={smsEnabled}
                onValueChange={setSmsEnabled}
              />
            </FieldGroup>
          </div>
        </div>

        {errors.channel && (
          <p className="text-xs text-destructive px-5 pb-2">{errors.channel}</p>
        )}

        <DialogFooter className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic mr-auto">
            ¹ SMS text fees may apply
          </p>
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
