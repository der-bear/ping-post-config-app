import { useState } from 'react'
import { FileText, FolderOpen, Plus, X } from 'lucide-react'

import { DataGrid } from '@/components/data-grid'
import { DataGridToolbar, ToolbarAction, ToolbarSeparator } from '@/components/data-grid/data-grid-toolbar'
import type { DataGridColumn } from '@/components/data-grid/types'
import { useCampaignStore } from '../store'
import type { PhoneNumberConfig } from '../types'
import { IvrNumberDialog } from './ivr-number-dialog'

const columns: DataGridColumn<PhoneNumberConfig>[] = [
  { key: 'name', header: 'Name', width: '33%' },
  { key: 'number', header: 'Number', width: '33%' },
  { key: 'callFlow', header: 'Call Flow', width: '34%' },
]

export function PhoneNumbers() {
  const phoneNumbers = useCampaignStore((state) => state.config.phoneNumbers)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <DataGrid
          columns={columns}
          data={phoneNumbers}
          emptyMessage="No IVR Numbers"
          className="[&_tbody_td]:h-[360px] [&_tbody_td]:align-middle"
          footer={
            <p className="px-1 py-1 italic">Note: IVR changes save automatically</p>
          }
          toolbar={
            <DataGridToolbar>
              <ToolbarAction icon={Plus} label="Add" onClick={() => setDialogOpen(true)} />
              <ToolbarAction icon={FolderOpen} label="Edit" disabled />
              <ToolbarSeparator />
              <ToolbarAction icon={X} label="Delete" disabled />
              <ToolbarSeparator />
              <ToolbarAction icon={FileText} label="Edit Script" disabled />
            </DataGridToolbar>
          }
        />
      </div>

      <IvrNumberDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
