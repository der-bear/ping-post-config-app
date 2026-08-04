import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field-group'
import { SelectBox } from '@/components/ui/select-box'
import { LEAD_FIELDS as MORTGAGE_LEAD_FIELDS } from '@/data/lead-fields'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PingFieldRequirement } from '../types'

const CORE_LEAD_FIELDS = ['Address', 'Country', 'First Name', 'Last Name', 'Email', 'Phone'] as const
const REQUIREMENT_TYPES = ['Optional', 'Required'] as const
const CORE_LEAD_FIELD_LABELS = new Set<string>(CORE_LEAD_FIELDS)
const LEAD_FIELD_OPTIONS = [
  ...CORE_LEAD_FIELDS.map((leadField) => ({
    value: leadField,
    label: leadField,
  })),
  ...MORTGAGE_LEAD_FIELDS
    .filter((leadField) => !CORE_LEAD_FIELD_LABELS.has(leadField.label))
    .map((leadField) => ({
      value: leadField.label,
      label: leadField.label,
    })),
]

interface PingRequiredFieldDialogProps {
  open: boolean
  onClose: () => void
  onSave: (requirement: Omit<PingFieldRequirement, 'id'>) => void
}

export function PingRequiredFieldDialog({
  open,
  onClose,
  onSave,
}: PingRequiredFieldDialogProps) {
  const [field, setField] = useState<string>('Address')
  const [type, setType] = useState<string>('Optional')

  const handleSave = () => {
    onSave({ field, type })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-[640px] gap-0 overflow-hidden p-0 shadow-panel"
        showClose={false}
      >
        <DialogPanelHeader title="PING Required Field" onClose={onClose} className="px-5 py-4" />
        <DialogDescription className="sr-only">
          Select the lead field and whether it is required or optional for the PING request.
        </DialogDescription>

        <div className="space-y-5 px-5 py-5">
          <FieldGroup label="Select Lead Field">
            <SelectBox
              searchable
              ariaLabel="Select Lead Field"
              options={LEAD_FIELD_OPTIONS}
              value={field}
              onValueChange={setField}
              placeholder="Search lead fields"
              emptyMessage="No lead fields found"
            />
          </FieldGroup>

          <FieldGroup label="Type">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUIREMENT_TYPES.map((requirementType) => (
                  <SelectItem key={requirementType} value={requirementType}>
                    {requirementType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

        <DialogFooter className="border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
