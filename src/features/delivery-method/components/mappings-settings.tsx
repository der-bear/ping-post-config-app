import { useState, useCallback, useMemo } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import {
  DataGrid,
  DataGridToolbar,
  ToolbarAction,
  ToolbarSeparator,
} from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Layers,
  FolderOpen,
  X,
  Type,
  FileText,
  Settings2,
  Hash,
  SplitSquareHorizontal,
  Link2,
  User,
  Globe,
  Code2,
  KeyRound,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FieldMapping, MappingType } from '@/features/delivery-method/types'
import { BulkAddDialog } from './bulk-add-dialog'
import { AddReferenceIdDialog } from './add-reference-id-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const MAPPING_TYPE_OPTIONS: { type: MappingType; icon: typeof Type; disabled: boolean }[] = [
  { type: 'Static Value', icon: Type, disabled: true },
  { type: 'Lead Field', icon: FileText, disabled: false },
  { type: 'System Field', icon: Settings2, disabled: true },
  { type: 'Calculated Expression', icon: Hash, disabled: true },
  { type: 'Split Text', icon: SplitSquareHorizontal, disabled: true },
  { type: 'Text Concatenation', icon: Link2, disabled: true },
  { type: 'Client Field', icon: User, disabled: true },
  { type: 'Lead Source Field', icon: Globe, disabled: true },
  { type: 'Function', icon: Code2, disabled: true },
]

const MAPPING_TYPE_ICONS = MAPPING_TYPE_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.type] = opt.icon
    return acc
  },
  {} as Record<MappingType, typeof Type>,
)

interface MappingsSettingsProps {
  phase: 'ping' | 'post'
}

export function MappingsSettings({ phase }: MappingsSettingsProps) {
  const isPing = phase === 'ping'

  const pingMappings = useDeliveryMethodStore((s) => s.config.ping.mappings.mappings)
  const postMappings = useDeliveryMethodStore((s) => s.config.post.mappings.mappings)
  const removePingMapping = useDeliveryMethodStore((s) => s.removePingMapping)
  const removePostMapping = useDeliveryMethodStore((s) => s.removePostMapping)
  const addPingMappings = useDeliveryMethodStore((s) => s.addPingMappings)
  const addPostMappings = useDeliveryMethodStore((s) => s.addPostMappings)
  const addPostMapping = useDeliveryMethodStore((s) => s.addPostMapping)
  const replacePingMappings = useDeliveryMethodStore((s) => s.replacePingMappings)
  const replacePostMappings = useDeliveryMethodStore((s) => s.replacePostMappings)
  const openFlyout = useDeliveryMethodStore((s) => s.openFlyout)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAddOpen, setBulkAddOpen] = useState(false)
  const [referenceIdOpen, setReferenceIdOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const displayMappings = isPing ? pingMappings : postMappings

  const columns: DataGridColumn<FieldMapping>[] = useMemo(
    () => [
      {
        key: 'type',
        header: '',
        width: '40px',
        render: (_value, row) => {
          const Icon = MAPPING_TYPE_ICONS[row.type]
          return Icon ? <Icon className="size-4 text-muted-foreground" /> : null
        },
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        width: '140px',
      },
      {
        key: 'name',
        header: 'Name',
        sortable: true,
      },
      {
        key: 'mappedTo',
        header: 'Mapped To',
        sortable: true,
      },
    ],
    [],
  )

  const handleAdd = useCallback(() => {
    openFlyout(phase)
  }, [openFlyout, phase])

  const handleAddReferenceId = useCallback(() => {
    setReferenceIdOpen(true)
  }, [])

  const handleSaveReferenceId = useCallback(
    (deliveryFieldName: string) => {
      addPostMapping({
        id: `ref-${Date.now()}`,
        type: 'System Field',
        name: deliveryFieldName,
        mappedTo: 'ping_request_id',
        defaultValue: '',
        testValue: '',
        useInPost: false,
        hasValueMappings: false,
        valueMappings: [],
      })
    },
    [addPostMapping],
  )

  const handleEdit = useCallback(() => {
    if (selectedIds.size !== 1) return
    const id = Array.from(selectedIds)[0]
    const mapping = displayMappings.find((m) => m.id === id)
    if (mapping) openFlyout(phase, mapping)
  }, [selectedIds, displayMappings, openFlyout, phase])

  const handleRemove = useCallback(() => {
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    selectedIds.forEach((id) => {
      if (isPing) removePingMapping(id)
      else removePostMapping(id)
    })
    setSelectedIds(new Set())
  }, [selectedIds, isPing, removePingMapping, removePostMapping])

  const handleRowDoubleClick = useCallback(
    (row: FieldMapping) => {
      openFlyout(phase, row)
    },
    [openFlyout, phase],
  )

  const importableFromPing = useMemo(() => {
    if (isPing) return []
    const existingKeys = new Set(
      postMappings.map((m) => `${m.type}:${m.name}:${m.mappedTo}`),
    )
    return pingMappings.filter(
      (m) => !existingKeys.has(`${m.type}:${m.name}:${m.mappedTo}`),
    )
  }, [isPing, pingMappings, postMappings])

  const handleImportFromPing = useCallback(() => {
    if (importableFromPing.length === 0) return
    const stamp = Date.now()
    addPostMappings(
      importableFromPing.map((m, i) => ({
        ...m,
        id: `import-${stamp}-${i}`,
        useInPost: false,
      })),
    )
  }, [importableFromPing, addPostMappings])

  const handleBulkAdd = useCallback(
    (mappings: FieldMapping[]) => {
      if (isPing) addPingMappings(mappings)
      else addPostMappings(mappings)
    },
    [isPing, addPingMappings, addPostMappings],
  )

  const handleBulkReplace = useCallback(
    (mappings: FieldMapping[]) => {
      if (isPing) replacePingMappings(mappings)
      else replacePostMappings(mappings)
    },
    [isPing, replacePingMappings, replacePostMappings],
  )

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <DataGrid
        className="flex-1"
        columns={columns}
        data={displayMappings}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowDoubleClick={handleRowDoubleClick}
        footer={
          <p className="text-xs text-muted-foreground">
            Note: Mapping changes save automatically.
          </p>
        }
        toolbar={
          <DataGridToolbar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarAction icon={Plus} label="New" variant="dropdown" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {!isPing && (
                  <>
                    <DropdownMenuItem onSelect={handleAddReferenceId}>
                      <KeyRound className="h-4 w-4" />
                      PING Reference ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {MAPPING_TYPE_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.type}
                    disabled={opt.disabled}
                    onSelect={handleAdd}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ToolbarAction
              icon={Layers}
              label="Bulk Add"
              onClick={() => setBulkAddOpen(true)}
            />
            <ToolbarSeparator />
            <ToolbarAction
              icon={FolderOpen}
              label="Edit"
              onClick={handleEdit}
              disabled={selectedIds.size !== 1}
            />
            <ToolbarAction
              icon={X}
              label="Remove"
              onClick={handleRemove}
              disabled={selectedIds.size === 0}
            />
          </DataGridToolbar>
        }
        emptyMessage="No field mappings configured"
        afterContent={
          !isPing && pingMappings.length > 0 ? (
            <Button
              size="sm"
              onClick={handleImportFromPing}
              disabled={importableFromPing.length === 0}
              className="h-8 px-3.5 text-xs [&_svg]:size-3.5 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none"
            >
              <Download />
              {importableFromPing.length === 0
                ? 'No PING mappings to import'
                : `Import ${importableFromPing.length} ${importableFromPing.length === 1 ? 'mapping' : 'mappings'} from PING`}
            </Button>
          ) : undefined
        }
      />
      <BulkAddDialog
        open={bulkAddOpen}
        onClose={() => setBulkAddOpen(false)}
        onAdd={handleBulkAdd}
        onReplace={handleBulkReplace}
        phase={phase}
      />
      <AddReferenceIdDialog
        open={referenceIdOpen}
        onClose={() => setReferenceIdOpen(false)}
        onSave={handleSaveReferenceId}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Mapping"
        description={`Are you sure you want to delete the selected mapping${selectedIds.size > 1 ? 's' : ''}?`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
