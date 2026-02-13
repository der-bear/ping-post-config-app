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
} from 'lucide-react'
import type { FieldMapping, MappingType } from '@/features/delivery-method/types'
import { BulkAddDialog } from './bulk-add-dialog'

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

interface MappingsSettingsProps {
  phase: 'ping' | 'post'
}

export function MappingsSettings({ phase }: MappingsSettingsProps) {
  const isPing = phase === 'ping'

  const pingMappings = useDeliveryMethodStore((s) => s.config.ping.mappings.mappings)
  const postMappings = useDeliveryMethodStore((s) => s.config.post.mappings.mappings)
  const removePingMapping = useDeliveryMethodStore((s) => s.removePingMapping)
  const removePostMapping = useDeliveryMethodStore((s) => s.removePostMapping)
  const updatePingMapping = useDeliveryMethodStore((s) => s.updatePingMapping)
  const addPingMappings = useDeliveryMethodStore((s) => s.addPingMappings)
  const addPostMappings = useDeliveryMethodStore((s) => s.addPostMappings)
  const replacePingMappings = useDeliveryMethodStore((s) => s.replacePingMappings)
  const replacePostMappings = useDeliveryMethodStore((s) => s.replacePostMappings)
  const openFlyout = useDeliveryMethodStore((s) => s.openFlyout)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAddOpen, setBulkAddOpen] = useState(false)

  // For POST phase, always show combined PING (useInPost) + POST mappings
  const displayMappings = useMemo(() => {
    if (isPing) return pingMappings

    const inheritedPingMappings = pingMappings
      .filter((m) => m.useInPost)

    return [...inheritedPingMappings, ...postMappings]
  }, [isPing, pingMappings, postMappings])

  // Set of PING mapping IDs for quick inherited-check in POST view
  const pingMappingIds = useMemo(
    () => new Set(pingMappings.map((m) => m.id)),
    [pingMappings],
  )

  const columns: DataGridColumn<FieldMapping>[] = useMemo(
    () => [
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

  const handleEdit = useCallback(() => {
    if (selectedIds.size !== 1) return
    const id = Array.from(selectedIds)[0]
    const mapping = displayMappings.find((m) => m.id === id)
    if (mapping) {
      // Inherited PING mappings open in PING context so the flyout updates the PING store
      const context = !isPing && pingMappingIds.has(mapping.id) ? 'ping' : phase
      openFlyout(context, mapping)
    }
  }, [selectedIds, displayMappings, isPing, pingMappingIds, openFlyout, phase])

  const handleRemove = useCallback(() => {
    selectedIds.forEach((id) => {
      if (isPing) {
        removePingMapping(id)
      } else if (pingMappingIds.has(id)) {
        // Inherited PING mapping — reset useInPost instead of deleting
        updatePingMapping(id, { useInPost: false })
      } else {
        removePostMapping(id)
      }
    })
    setSelectedIds(new Set())
  }, [selectedIds, isPing, pingMappingIds, removePingMapping, removePostMapping, updatePingMapping])

  const handleRowDoubleClick = useCallback(
    (row: FieldMapping) => {
      // Inherited PING mappings open in PING context
      const context = !isPing && pingMappingIds.has(row.id) ? 'ping' : phase
      openFlyout(context, row)
    },
    [openFlyout, phase, isPing, pingMappingIds],
  )

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
        footer="Note: Mapping changes save automatically"
        toolbar={
          <DataGridToolbar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarAction icon={Plus} label="New" variant="dropdown" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
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
      />
      <BulkAddDialog
        open={bulkAddOpen}
        onClose={() => setBulkAddOpen(false)}
        onAdd={handleBulkAdd}
        onReplace={handleBulkReplace}
        phase={phase}
      />
    </div>
  )
}
