import { useState } from 'react'
import { useCampaignStore } from '../store'
import { DataGrid } from '@/components/data-grid'
import { DataGridToolbar, ToolbarAction } from '@/components/data-grid/data-grid-toolbar'
import { Plus, FolderOpen, X } from 'lucide-react'
import type { DataGridColumn } from '@/components/data-grid/types'
import type { CriteriaRule } from '../types'

const columns: DataGridColumn<CriteriaRule>[] = [
  { key: 'type', header: 'Type', width: '25%' },
  { key: 'field', header: 'Field', width: '25%' },
  { key: 'operator', header: 'Operator', width: '25%' },
  { key: 'value', header: 'Value', width: '25%' },
]

export function AgentForms() {
  const agentForms = useCampaignStore((s) => s.config.agentForms)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  return (
    <div className="absolute inset-0 flex flex-col">
      <DataGrid
        columns={columns}
        data={agentForms}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="No Criteria"
        toolbar={
          <DataGridToolbar>
            <ToolbarAction icon={Plus} label="New" variant="dropdown" />
            <ToolbarAction icon={FolderOpen} label="Edit" disabled={selectedIds.size !== 1} />
            <ToolbarAction icon={X} label="Remove" disabled={selectedIds.size === 0} />
          </DataGridToolbar>
        }
        footer={
          <p className="text-xs text-muted-foreground italic px-4 py-2">
            Note: Required criteria changes save automatically
          </p>
        }
      />
    </div>
  )
}
