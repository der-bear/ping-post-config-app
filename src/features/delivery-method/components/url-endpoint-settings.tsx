import { useState, useCallback, useMemo } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup, SectionHeading } from '@/components/field-group'
import { DebouncedInput } from '@/components/ui/debounced-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DataGrid,
  DataGridToolbar,
  ToolbarAction,
} from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid'
import { Plus, X } from 'lucide-react'
import type { ContentType, CustomHeader, HttpMethod } from '@/features/delivery-method/types'
import { AddHeaderDialog } from './add-header-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { validateUrl } from '@/lib/validation'
import { cn } from '@/lib/utils'

interface UrlEndpointSettingsProps {
  phase: 'ping' | 'post'
}

interface HeaderDisplay extends CustomHeader {
  inherited?: boolean
  source?: 'ping' | 'post'
}

const CONTENT_TYPES_PING = [
  { value: 'default', label: 'Default' },
  { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
  { value: 'application/json', label: 'application/json' },
  { value: 'application/soap+xml', label: 'application/soap+xml' },
  { value: 'application/xml', label: 'application/xml' },
  { value: 'application/octet-stream', label: 'application/octet-stream' },
  { value: 'text/xml', label: 'text/xml' },
  { value: 'text/plain', label: 'text/plain' },
]


const TIMEOUT_OPTIONS_PING = [
  { value: '5', label: '5 seconds' },
  { value: '10', label: '10 seconds' },
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '45', label: '45 seconds' },
  { value: '60', label: '60 seconds' },
  { value: '90', label: '90 seconds' },
  { value: '120', label: '120 seconds' },
]

const HTTP_METHODS: { value: HttpMethod; label: string }[] = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
]

const HEADER_COLUMNS: DataGridColumn<HeaderDisplay>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (value, row) => (
      <span className={row.inherited ? 'text-muted-foreground' : ''}>
        {String(value)}
        {row.inherited && <span className="ml-2 text-xs">(from PING)</span>}
      </span>
    ),
  },
  {
    key: 'value',
    header: 'Value',
    sortable: true,
    render: (value, row) => (
      <span className={row.inherited ? 'text-muted-foreground' : ''}>
        {String(value)}
      </span>
    ),
  },
]

export function UrlEndpointSettings({ phase }: UrlEndpointSettingsProps) {
  const isPing = phase === 'ping'

  const pingEndpoint = useDeliveryMethodStore((s) => s.config.ping.urlEndpoint)
  const postEndpoint = useDeliveryMethodStore((s) => s.config.post.urlEndpoint)
  const updatePingUrlEndpoint = useDeliveryMethodStore((s) => s.updatePingUrlEndpoint)
  const updatePostUrlEndpoint = useDeliveryMethodStore((s) => s.updatePostUrlEndpoint)
  const addPingHeader = useDeliveryMethodStore((s) => s.addPingHeader)
  const removePingHeader = useDeliveryMethodStore((s) => s.removePingHeader)
  const addPostHeader = useDeliveryMethodStore((s) => s.addPostHeader)
  const removePostHeader = useDeliveryMethodStore((s) => s.removePostHeader)
  const updatePingHeader = useDeliveryMethodStore((s) => s.updatePingHeader)
  const updatePostHeader = useDeliveryMethodStore((s) => s.updatePostHeader)

  const endpoint = isPing ? pingEndpoint : postEndpoint
  const updateEndpoint = isPing ? updatePingUrlEndpoint : updatePostUrlEndpoint
  const addHeader = isPing ? addPingHeader : addPostHeader
  const removeHeader = isPing ? removePingHeader : removePostHeader
  const updateHeader = isPing ? updatePingHeader : updatePostHeader

  const [selectedHeaderIds, setSelectedHeaderIds] = useState<Set<string>>(new Set())
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false)
  const [editingHeader, setEditingHeader] = useState<CustomHeader | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const headerData = useMemo<HeaderDisplay[]>(() => {
    if (isPing) {
      return endpoint.customHeaders.map((h) => ({ ...h, inherited: false, source: 'ping' as const }))
    }
    if (postEndpoint.includeHeadersFromPing) {
      const inherited = pingEndpoint.customHeaders.map((h) => ({ ...h, inherited: true, source: 'ping' as const }))
      const postOnly = postEndpoint.customHeaders.map((h) => ({ ...h, inherited: false, source: 'post' as const }))
      return [...inherited, ...postOnly]
    }
    return postEndpoint.customHeaders.map((h) => ({ ...h, inherited: false, source: 'post' as const }))
  }, [isPing, endpoint.customHeaders, postEndpoint.includeHeadersFromPing, postEndpoint.customHeaders, pingEndpoint.customHeaders])

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    // Filter out inherited headers - they can't be selected in POST
    const selectableIds = Array.from(ids).filter((id) => {
      const header = headerData.find((h) => h.id === id)
      return header && !header.inherited
    })
    setSelectedHeaderIds(new Set(selectableIds))
  }, [headerData])

  const handleAddHeader = useCallback(() => {
    setEditingHeader(null)
    setHeaderDialogOpen(true)
  }, [])

  const handleRowDoubleClick = useCallback((row: HeaderDisplay) => {
    if (row.inherited) return // Prevent editing inherited headers
    setEditingHeader(row)
    setHeaderDialogOpen(true)
  }, [])

  const handleSaveHeader = useCallback((header: CustomHeader) => {
    if (editingHeader) {
      updateHeader(editingHeader.id, { name: header.name, value: header.value })
    } else {
      addHeader(header)
    }
  }, [editingHeader, updateHeader, addHeader])

  const handleRemoveHeaders = useCallback(() => {
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    // Filter out inherited headers - they can't be deleted from POST
    const deletableIds = Array.from(selectedHeaderIds).filter((id) => {
      const header = headerData.find((h) => h.id === id)
      return header && !header.inherited
    })
    deletableIds.forEach((id) => removeHeader(id))
    setSelectedHeaderIds(new Set())
  }, [selectedHeaderIds, removeHeader, headerData])

  const sameAsPingMeta = 'Same as PING'

  const timeoutValue = !isPing && postEndpoint.timeoutSameAsPing
    ? 'same-as-ping'
    : String(endpoint.timeout)

  return (
    <div className="space-y-5">
      <FieldGroup label="Production URL">
        <DebouncedInput
          value={endpoint.productionUrl}
          onValueCommit={(v: string) => updateEndpoint({ productionUrl: v })}
          onBlur={(e) => {
            const error = validateUrl(e.target.value)
            setErrors(prev => ({ ...prev, productionUrl: error }))
          }}
          onChange={() => {
            if (errors.productionUrl) {
              setErrors(prev => ({ ...prev, productionUrl: '' }))
            }
          }}
          placeholder="https://api.example.com/leads"
          className={cn(errors.productionUrl && 'border-destructive')}
        />
        {errors.productionUrl && (
          <p className="text-xs text-destructive mt-1">{errors.productionUrl}</p>
        )}
      </FieldGroup>

      <FieldGroup label="Testing / Sandbox URL">
        <DebouncedInput
          value={endpoint.testingUrl}
          onValueCommit={(v: string) => updateEndpoint({ testingUrl: v })}
          onBlur={(e) => {
            const error = validateUrl(e.target.value)
            setErrors(prev => ({ ...prev, testingUrl: error }))
          }}
          onChange={() => {
            if (errors.testingUrl) {
              setErrors(prev => ({ ...prev, testingUrl: '' }))
            }
          }}
          placeholder="https://sandbox.example.com/leads"
          className={cn(errors.testingUrl && 'border-destructive')}
        />
        {errors.testingUrl && (
          <p className="text-xs text-destructive mt-1">{errors.testingUrl}</p>
        )}
      </FieldGroup>

      {!isPing && (
        <FieldGroup label="Method">
          <Select
            value={postEndpoint.method}
            onValueChange={(value: HttpMethod) =>
              updatePostUrlEndpoint({ method: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      )}

      <Separator />

      <SectionHeading title="Request Settings" />

      <FieldGroup label="Content Type">
        <Select
          value={
            !isPing && postEndpoint.contentTypeSameAsPing
              ? 'same-as-ping'
              : endpoint.contentType
          }
          onValueChange={(value) => {
            if (!isPing && value === 'same-as-ping') {
              updatePostUrlEndpoint({ contentTypeSameAsPing: true })
            } else if (!isPing) {
              updatePostUrlEndpoint({
                contentTypeSameAsPing: false,
                contentType: value as ContentType,
              })
            } else {
              updateEndpoint({ contentType: value as ContentType })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPES_PING.map((ct) => {
              if (!isPing && ct.value === pingEndpoint.contentType) {
                return (
                  <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                    {ct.label}
                  </SelectItem>
                )
              }
              return (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>

      <FieldGroup label="Timeout">
        <Select
          value={timeoutValue}
          onValueChange={(value) => {
            if (value === 'same-as-ping') {
              updatePostUrlEndpoint({ timeoutSameAsPing: true })
            } else {
              if (!isPing) {
                updatePostUrlEndpoint({ timeoutSameAsPing: false, timeout: Number(value) })
              } else {
                updateEndpoint({ timeout: Number(value) })
              }
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timeout" />
          </SelectTrigger>
          <SelectContent>
            {TIMEOUT_OPTIONS_PING.map((opt) => {
              if (!isPing && opt.value === String(pingEndpoint.timeout)) {
                return (
                  <SelectItem key="same-as-ping" value="same-as-ping" meta={sameAsPingMeta}>
                    {opt.label}
                  </SelectItem>
                )
              }
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator />

      <div className="flex items-center justify-between">
        <SectionHeading title="Custom Headers" />
        {!isPing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={postEndpoint.includeHeadersFromPing}
              onCheckedChange={(checked) =>
                updatePostUrlEndpoint({ includeHeadersFromPing: checked === true })
              }
            />
            <span className="text-sm">Include from PING</span>
          </label>
        )}
      </div>

      <DataGrid
        columns={HEADER_COLUMNS}
        data={headerData}
        selectedIds={selectedHeaderIds}
        onSelectionChange={handleSelectionChange}
        onRowDoubleClick={handleRowDoubleClick}
        getRowClassName={(row) => row.inherited ? 'bg-muted/30 hover:bg-muted/40' : ''}
        emptyMessage="No custom headers"
        toolbar={
          <DataGridToolbar>
            <ToolbarAction
              icon={Plus}
              label="New"
              onClick={handleAddHeader}
            />
            <ToolbarAction
              icon={X}
              label="Remove"
              onClick={handleRemoveHeaders}
              disabled={selectedHeaderIds.size === 0}
            />
          </DataGridToolbar>
        }
      />

      <AddHeaderDialog
        open={headerDialogOpen}
        onClose={() => setHeaderDialogOpen(false)}
        onSave={handleSaveHeader}
        editData={editingHeader}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Custom Header"
        description={`Are you sure you want to delete the selected custom header${selectedHeaderIds.size > 1 ? 's' : ''}?`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
