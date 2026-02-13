import { useState, useCallback, useMemo } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DataGrid,
  DataGridToolbar,
  ToolbarAction,
} from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import { Plus, X } from 'lucide-react'
import type { NotificationRecipient } from '@/features/delivery-method/types'
import { AddNotificationDialog } from './add-notification-dialog'

export function NotificationsSettings() {
  const notifications = useDeliveryMethodStore((s) => s.config.notifications)
  const updateNotifications = useDeliveryMethodStore((s) => s.updateNotifications)
  const addNotificationRecipient = useDeliveryMethodStore(
    (s) => s.addNotificationRecipient,
  )
  const removeNotificationRecipient = useDeliveryMethodStore(
    (s) => s.removeNotificationRecipient,
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)

  const columns: DataGridColumn<NotificationRecipient>[] = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        sortable: true,
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        width: '120px',
        render: (value) => {
          const typeStr = String(value)
          return typeStr === 'email' ? 'Email' : 'SMS'
        },
      },
    ],
    [],
  )

  const handleAddRecipient = useCallback(() => {
    setDialogOpen(true)
  }, [])

  const handleSaveRecipients = useCallback((recipients: NotificationRecipient[]) => {
    recipients.forEach((r) => addNotificationRecipient(r))
  }, [addNotificationRecipient])

  const handleRemoveRecipients = useCallback(() => {
    selectedIds.forEach((id) => removeNotificationRecipient(id))
    setSelectedIds(new Set())
  }, [selectedIds, removeNotificationRecipient])

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-start">
        <Switch
          id="send-notification"
          checked={notifications.sendNotification}
          onCheckedChange={(checked) =>
            updateNotifications({ sendNotification: checked })
          }
        />
        <div className="space-y-0.5">
          <Label htmlFor="send-notification" className="text-sm font-normal cursor-pointer">Send Notification</Label>
          <p className="text-xs text-muted-foreground">
            Send a notification when delivery fails.
          </p>
        </div>
      </div>

      <Separator />

      <DataGrid
        columns={columns}
        data={notifications.recipients}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="No notification recipients"
        toolbar={
          <DataGridToolbar>
            <ToolbarAction
              icon={Plus}
              label="Add Recipient"
              onClick={handleAddRecipient}
            />
            <ToolbarAction
              icon={X}
              label="Remove"
              onClick={handleRemoveRecipients}
              disabled={selectedIds.size === 0}
            />
          </DataGridToolbar>
        }
      />

      <AddNotificationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRecipients}
      />
    </div>
  )
}
