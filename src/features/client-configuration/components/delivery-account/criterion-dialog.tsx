import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
  FieldGroup,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

import type { CriteriaRule } from '../../types'

interface CriterionDialogProps {
  open: boolean
  initialValue?: CriteriaRule
  onSave: (criterion: Omit<CriteriaRule, 'id'>) => void
  onClose: () => void
}

const defaultCriterion: Omit<CriteriaRule, 'id'> = {
  type: 'Field Value',
  field: 'State',
  operator: 'Is Any Of',
  value: 'AZ',
}

export function CriterionDialog({
  open,
  initialValue,
  onSave,
  onClose,
}: CriterionDialogProps) {
  const [criterion, setCriterion] = useState<Omit<CriteriaRule, 'id'>>(() =>
    initialValue
      ? {
          type: initialValue.type,
          field: initialValue.field,
          operator: initialValue.operator,
          value: initialValue.value,
        }
      : defaultCriterion,
  )
  const [valueError, setValueError] = useState('')

  const handleSave = () => {
    if (!criterion.value.trim()) {
      setValueError('Value is required.')
      return
    }
    onSave({ ...criterion, value: criterion.value.trim() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showClose={false}
        className="max-w-[620px] gap-0 overflow-hidden p-0 shadow-panel"
      >
        <DialogPanelHeader
          title={initialValue ? 'Edit Delivery Criterion' : 'New Delivery Criterion'}
          onClose={onClose}
        />
        <DialogDescription className="sr-only">
          Configure a field rule that controls which leads qualify for this Delivery Account.
        </DialogDescription>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <FieldGroup label="Type">
            <Select
              value={criterion.type}
              onValueChange={(type) =>
                setCriterion((current) => ({ ...current, type: type as CriteriaRule['type'] }))
              }
            >
              <SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Field Value">Field Value</SelectItem>
                <SelectItem value="Client Field">Client Field</SelectItem>
                <SelectItem value="Regular Expression">Regular Expression</SelectItem>
                <SelectItem value="Calculated Expression">Calculated Expression</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Field">
            <Select
              value={criterion.field}
              onValueChange={(field) => setCriterion((current) => ({ ...current, field }))}
            >
              <SelectTrigger aria-label="Field"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="Postal Code">Postal Code</SelectItem>
                <SelectItem value="Loan Amount">Loan Amount</SelectItem>
                <SelectItem value="Credit Rating">Credit Rating</SelectItem>
                <SelectItem value="Property Type">Property Type</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Operator">
            <Select
              value={criterion.operator}
              onValueChange={(operator) => setCriterion((current) => ({ ...current, operator }))}
            >
              <SelectTrigger aria-label="Operator"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Is Any Of">Is Any Of</SelectItem>
                <SelectItem value="Is Not Any Of">Is Not Any Of</SelectItem>
                <SelectItem value="Equals">Equals</SelectItem>
                <SelectItem value="Greater Than">Greater Than</SelectItem>
                <SelectItem value="Less Than">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Value" required>
            <Input
              aria-label="Value"
              value={criterion.value}
              aria-invalid={Boolean(valueError)}
              onChange={(event) => {
                setCriterion((current) => ({ ...current, value: event.target.value }))
                setValueError('')
              }}
            />
            {valueError && <p className="mt-1 text-xs text-destructive">{valueError}</p>}
          </FieldGroup>
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
