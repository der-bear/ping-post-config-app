import { useMemo, useState } from 'react'
import { FolderOpen, Plus, X } from 'lucide-react'

import { DataGrid, DataGridToolbar, ToolbarAction } from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import {
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

import { useClientConfigurationStore } from '../../store'
import type { CriteriaRule } from '../../types'
import { CriterionDialog } from './criterion-dialog'

const columns: DataGridColumn<CriteriaRule>[] = [
  { key: 'type', header: 'Type', width: '24%', sortable: true },
  { key: 'field', header: 'Field', width: '24%', sortable: true },
  { key: 'operator', header: 'Operator', width: '26%', sortable: true },
  { key: 'value', header: 'Value', width: '26%', sortable: true },
]

export function CriteriaPanel() {
  const criteria = useClientConfigurationStore((state) => state.config.deliveryAccount.criteria)
  const addCriterion = useClientConfigurationStore((state) => state.addCriterion)
  const updateCriterion = useClientConfigurationStore((state) => state.updateCriterion)
  const removeCriteria = useClientConfigurationStore((state) => state.removeCriteria)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogMode, setDialogMode] = useState<'new' | 'edit' | null>(null)
  const [criterionType, setCriterionType] = useState<CriteriaRule['type']>('Lead Field')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedCriterion = useMemo(
    () => criteria.find((criterion) => selectedIds.has(criterion.id)),
    [criteria, selectedIds],
  )

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <DataGrid
          columns={columns}
          data={criteria}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowDoubleClick={(criterion) => {
            setSelectedIds(new Set([criterion.id]))
            setDialogMode('edit')
          }}
          emptyMessage="No Criteria"
          toolbar={
            <DataGridToolbar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToolbarAction icon={Plus} label="New" variant="dropdown" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[210px]">
                  {[
                    'Lead Field',
                    'Client Field',
                    'Regular Expression',
                    'Calculated Expression',
                    'Evaluate Function',
                  ].map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onSelect={() => {
                        setCriterionType(type as CriteriaRule['type'])
                        setDialogMode('new')
                      }}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
            <p className="px-4 py-2 text-xs italic text-muted-foreground">
              Note: Criteria changes save automatically
            </p>
          }
        />
      </div>

      {dialogMode && (
        <CriterionDialog
          key={`${dialogMode}-${selectedCriterion?.id ?? 'new'}`}
          open
          criterionType={criterionType}
          initialValue={dialogMode === 'edit' ? selectedCriterion : undefined}
          onClose={() => setDialogMode(null)}
          onSave={(criterion) => {
            if (dialogMode === 'edit' && selectedCriterion) {
              updateCriterion(selectedCriterion.id, criterion)
              return
            }
            const id = `criterion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            addCriterion({ id, ...criterion })
            setSelectedIds(new Set([id]))
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Remove delivery criteria"
        description={
          selectedIds.size === 1
            ? 'Remove the selected delivery criterion? This change saves automatically.'
            : `Remove ${selectedIds.size} selected delivery criteria? This change saves automatically.`
        }
        confirmLabel="Remove"
        variant="destructive"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeCriteria([...selectedIds])
          setSelectedIds(new Set())
        }}
      />
    </>
  )
}
