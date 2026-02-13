import { useState, useCallback, useMemo } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { Switch } from '@/components/ui/switch'
import {
  DataGrid,
  DataGridToolbar,
  ToolbarAction,
} from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import { Plus, X } from 'lucide-react'
import type { NotificationRecipient } from '@/features/delivery-method/types'
import { AddNotificationDialog } from './add-notification-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

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
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    selectedIds.forEach((id) => removeNotificationRecipient(id))
    setSelectedIds(new Set())
  }, [selectedIds, removeNotificationRecipient])

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <label className="flex gap-4 items-start cursor-pointer">
          <Switch
            checked={notifications.sendNotification}
            onCheckedChange={(checked) =>
              updateNotifications({ sendNotification: checked })
            }
          />
          <div className="space-y-0.5">
            <span className="text-sm font-normal">Send Notification</span>
            <p className="text-xs text-muted-foreground">
              Send a notification when delivery fails.
            </p>
          </div>
        </label>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          data={notifications.recipients}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="No notification recipients"
          className="border-t border-border border-x-0 border-b-0"
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
          footer={
            <p className="text-xs text-muted-foreground">
              Note: Notification recipient changes save automatically. SMS charges may apply.
            </p>
          }
        />
      </div>

      <AddNotificationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRecipients}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        description={`Are you sure you want to delete the selected notification recipient${selectedIds.size > 1 ? 's' : ''}?`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
