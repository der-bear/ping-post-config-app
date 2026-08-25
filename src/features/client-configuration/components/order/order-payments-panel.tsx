import { BadgeDollarSign, FolderOpen, Undo2 } from 'lucide-react'

import { DataGrid, DataGridToolbar, ToolbarAction } from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'

interface PaymentRow {
  id: string
  type: string
  date: string
  amount: string
  status: string
  applied: string
}

const columns: DataGridColumn<PaymentRow>[] = [
  { key: 'type', header: 'Type', width: '22%', sortable: true },
  { key: 'date', header: 'Date', width: '20%', sortable: true },
  { key: 'amount', header: 'Amount', width: '18%', sortable: true },
  { key: 'status', header: 'Status', width: '20%', sortable: true },
  { key: 'applied', header: 'Applied', width: '20%', sortable: true },
]

export function OrderPaymentsPanel() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <DataGrid
        columns={columns}
        data={[]}
        emptyMessage={<span aria-hidden="true">&nbsp;</span>}
        toolbar={
          <DataGridToolbar>
            <ToolbarAction icon={BadgeDollarSign} label="Apply Payment" />
            <ToolbarAction icon={FolderOpen} label="View" disabled />
            <ToolbarAction icon={Undo2} label="Reverse" disabled />
          </DataGridToolbar>
        }
        footer={
          <div className="w-full">
            <div className="flex items-center justify-between py-2 font-medium text-foreground">
              <span>Total:</span>
              <span>$0.00</span>
            </div>
            <p className="border-t border-border py-2 italic text-muted-foreground">
              Note: Payment changes save automatically
            </p>
          </div>
        }
      />
    </div>
  )
}
