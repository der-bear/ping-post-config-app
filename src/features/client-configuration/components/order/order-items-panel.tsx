import { useMemo, useState } from 'react'
import { FolderOpen, Plus, X } from 'lucide-react'

import { DataGrid, DataGridToolbar, ToolbarAction } from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import { ConfirmDialog } from '@/components/ui'

import { useClientConfigurationStore } from '../../store'
import type { OrderItem } from '../../types'
import { OrderItemDialog } from './order-item-dialog'

interface OrderItemRow extends OrderItem {
  total: string
  sentAmount: string
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const columns: DataGridColumn<OrderItemRow>[] = [
  { key: 'deliveryAccount', header: 'Delivery Account', width: '34%', sortable: true },
  { key: 'quantity', header: 'Qty', width: '12%', sortable: true },
  { key: 'total', header: 'Total $', width: '18%' },
  { key: 'sent', header: 'Sent', width: '12%', sortable: true },
  { key: 'sentAmount', header: 'Sent $', width: '18%' },
]

export function OrderItemsPanel() {
  const deliveryAccountName = useClientConfigurationStore((state) => state.config.deliveryAccount.name)
  const items = useClientConfigurationStore((state) => state.config.order.items)
  const addOrderItem = useClientConfigurationStore((state) => state.addOrderItem)
  const updateOrderItem = useClientConfigurationStore((state) => state.updateOrderItem)
  const removeOrderItems = useClientConfigurationStore((state) => state.removeOrderItems)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogMode, setDialogMode] = useState<'new' | 'edit' | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const rows = useMemo<OrderItemRow[]>(
    () => items.map((item) => ({
      ...item,
      total: currency(item.quantity * item.perLeadPrice),
      sentAmount: currency(item.sent * item.perLeadPrice),
    })),
    [items],
  )
  const selectedItem = useMemo(
    () => items.find((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  )
  const orderedQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const orderedTotal = items.reduce((sum, item) => sum + item.quantity * item.perLeadPrice, 0)
  const sentQuantity = items.reduce((sum, item) => sum + item.sent, 0)
  const sentTotal = items.reduce((sum, item) => sum + item.sent * item.perLeadPrice, 0)

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <DataGrid
          columns={columns}
          data={rows}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowDoubleClick={(item) => {
            setSelectedIds(new Set([item.id]))
            setDialogMode('edit')
          }}
          emptyMessage="No Items"
          toolbar={
            <DataGridToolbar>
              <ToolbarAction icon={Plus} label="New" onClick={() => setDialogMode('new')} />
              <ToolbarAction
                icon={FolderOpen}
                label="Edit"
                disabled={selectedIds.size !== 1}
                onClick={() => setDialogMode('edit')}
              />
              <ToolbarAction
                icon={X}
                label="Remove"
                disabled={selectedIds.size === 0}
                onClick={() => setConfirmOpen(true)}
              />
            </DataGridToolbar>
          }
          footer={
            <div className="w-full">
              <div className="grid grid-cols-[34%_12%_18%_12%_18%] items-center px-3 py-2 font-medium text-foreground">
                <span>Totals:</span>
                <span>{orderedQuantity}</span>
                <span>{currency(orderedTotal)}</span>
                <span>{sentQuantity}</span>
                <span>{currency(sentTotal)}</span>
              </div>
              <p className="border-t border-border px-3 py-2 italic text-muted-foreground">
                Note: Item changes save automatically
              </p>
            </div>
          }
        />
      </div>

      {dialogMode && (
        <OrderItemDialog
          key={`${dialogMode}-${selectedItem?.id ?? 'new'}`}
          open
          deliveryAccountName={deliveryAccountName}
          initialValue={dialogMode === 'edit' ? selectedItem : undefined}
          onClose={() => setDialogMode(null)}
          onSave={(item) => {
            if (dialogMode === 'edit' && selectedItem) {
              updateOrderItem(selectedItem.id, item)
              return
            }
            const id = `order-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            addOrderItem({ id, ...item, sent: 0 })
            setSelectedIds(new Set([id]))
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Remove order items"
        description={
          selectedIds.size === 1
            ? 'Remove the selected order item? This change saves automatically.'
            : `Remove ${selectedIds.size} selected order items? This change saves automatically.`
        }
        confirmLabel="Remove"
        variant="destructive"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeOrderItems([...selectedIds])
          setSelectedIds(new Set())
        }}
      />
    </>
  )
}
