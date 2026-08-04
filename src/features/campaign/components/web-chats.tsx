import { useState } from 'react'
import { FileText, FolderOpen, Plus, X } from 'lucide-react'

import { DataGrid } from '@/components/data-grid'
import { DataGridToolbar, ToolbarAction, ToolbarSeparator } from '@/components/data-grid/data-grid-toolbar'
import type { DataGridColumn } from '@/components/data-grid/types'
import { useCampaignStore } from '../store'
import type { WebChatConfig } from '../types'
import { WebChatDialog } from './web-chat-dialog'

const columns: DataGridColumn<WebChatConfig>[] = [
  { key: 'name', header: 'Name', width: '50%' },
  { key: 'messageFlow', header: 'Message Flow', width: '50%' },
]

export function WebChats() {
  const webChats = useCampaignStore((state) => state.config.webChats)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <DataGrid
          columns={columns}
          data={webChats}
          emptyMessage="No Web Chats"
          className="[&_tbody_td]:h-[360px] [&_tbody_td]:align-middle"
          toolbar={
            <DataGridToolbar>
              <ToolbarAction icon={Plus} label="Add" onClick={() => setDialogOpen(true)} />
              <ToolbarAction icon={FolderOpen} label="Edit" disabled />
              <ToolbarSeparator />
              <ToolbarAction icon={X} label="Delete" disabled />
              <ToolbarSeparator />
              <ToolbarAction icon={FileText} label="View Script" disabled />
            </DataGridToolbar>
          }
          footer={
            <p className="px-1 py-1 italic">Note: Web chat changes save automatically</p>
          }
        />
      </div>

      <WebChatDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
