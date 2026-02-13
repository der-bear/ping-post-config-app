import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SYSTEM_LEAD_FIELDS } from '@/features/delivery-method/data/system-lead-fields'
import type { FieldMapping } from '@/features/delivery-method/types'
import { cn } from '@/lib/utils'

interface BulkAddDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (mappings: FieldMapping[]) => void
  onReplace: (mappings: FieldMapping[]) => void
  phase: 'ping' | 'post'
}

interface FieldRow {
  name: string
  enumCount?: number
  included: boolean
  deliveryName: string
}

export function BulkAddDialog({
  open,
  onClose,
  onAdd,
  onReplace,
  phase,
}: BulkAddDialogProps) {
  const [mode, setMode] = useState<'replace' | 'append'>('replace')
  const [errors, setErrors] = useState<Record<number, boolean>>({})

  const initialRows = useMemo(
    () =>
      SYSTEM_LEAD_FIELDS.map((f) => ({
        name: f.name,
        enumCount: f.enumCount,
        included: false,
        deliveryName: f.name,
      })),
    [],
  )

  const [rows, setRows] = useState<FieldRow[]>(initialRows)

  // Reset rows when dialog opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setRows(initialRows)
        setMode('replace')
        setErrors({})
      } else {
        onClose()
      }
    },
    [initialRows, onClose],
  )

  const toggleInclude = useCallback((index: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, included: !r.included } : r)),
    )
  }, [])

  const updateDeliveryName = useCallback((index: number, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, deliveryName: value } : r)),
    )
  }, [])

  const selectedCount = useMemo(
    () => rows.filter((r) => r.included).length,
    [rows],
  )

  const handleSubmit = useCallback(() => {
    // Validate: check for included rows with empty delivery names
    const newErrors: Record<number, boolean> = {}
    rows.forEach((r, index) => {
      if (r.included && !r.deliveryName.trim()) {
        newErrors[index] = true
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const mappings: FieldMapping[] = rows
      .filter((r) => r.included && r.deliveryName.trim())
      .map((r) => ({
        id: `bulk-${phase}-${r.name}-${Date.now()}`,
        type: 'Lead Field' as const,
        name: r.name,
        mappedTo: r.deliveryName.trim(),
        defaultValue: '',
        testValue: '',
        useInPost: phase === 'ping',
        hasValueMappings: false,
        valueMappings: [],
      }))

    if (mappings.length === 0) return

    if (mode === 'replace') {
      onReplace(mappings)
    } else {
      onAdd(mappings)
    }
    onClose()
  }, [rows, mode, phase, onAdd, onReplace, onClose])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[653px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.1)]"
        showClose={false}
      >
        <DialogPanelHeader title="Select Fields to Add" />
        <DialogDescription className="sr-only">
          Select system lead fields to add as mappings
        </DialogDescription>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-xs font-semibold text-foreground w-[72px]">
                  Include
                </th>
                <th className="text-left p-2 text-xs font-semibold text-foreground w-[219px]">
                  System Lead Field
                </th>
                <th className="text-left p-2 text-xs font-semibold text-foreground">
                  Delivery Field Name
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.name} className="border-b border-border h-12">
                  <td className="p-2">
                    <Switch
                      checked={row.included}
                      onCheckedChange={() => toggleInclude(index)}
                    />
                  </td>
                  <td className={`p-2 text-sm ${row.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {row.name}
                    {row.enumCount != null && (
                      <span className="text-muted-foreground">
                        {' '}
                        ({row.enumCount} enum)
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <Input
                      value={row.deliveryName}
                      onChange={(e) => {
                        updateDeliveryName(index, e.target.value)
                        if (errors[index]) {
                          setErrors((prev) => {
                            const next = { ...prev }
                            delete next[index]
                            return next
                          })
                        }
                      }}
                      disabled={!row.included}
                      className={cn(errors[index] && 'border-destructive')}
                    />
                    {errors[index] && (
                      <p className="text-xs text-destructive mt-1">
                        Enter field name
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
          <Select value={mode} onValueChange={(v) => setMode(v as 'replace' | 'append')}>
            <SelectTrigger className="h-8 w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">Replace</SelectItem>
              <SelectItem value="append">Append</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={selectedCount === 0}>
              Add Field Mappings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
