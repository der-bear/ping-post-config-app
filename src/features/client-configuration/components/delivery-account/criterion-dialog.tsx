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
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { US_STATE_ENUM_VALUES } from '@/data/lead-fields'

import type { CriteriaRule } from '../../types'

interface CriterionDialogProps {
  open: boolean
  criterionType?: CriteriaRule['type']
  initialValue?: CriteriaRule
  onSave: (criterion: Omit<CriteriaRule, 'id'>) => void
  onClose: () => void
}

const STATE_OPTIONS = [
  ...US_STATE_ENUM_VALUES,
  { value: 'AS', label: 'American Samoa' },
  { value: 'AF', label: 'Armed Forces' },
  { value: 'AE', label: 'Armed Forces (AE)' },
  { value: 'AP', label: 'Armed Forces (AP)' },
  { value: 'CZ', label: 'Canal Zone' },
  { value: 'GU', label: 'Guam' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'FM', label: 'Micronesia' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'PW', label: 'Palau' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'Virgin Islands' },
].sort((left, right) => left.label.localeCompare(right.label))

export function CriterionDialog({
  open,
  criterionType = 'Lead Field',
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
      : { type: criterionType, field: '', operator: '', value: '' },
  )
  const [errors, setErrors] = useState<Record<'field' | 'operator' | 'value', string>>({
    field: '',
    operator: '',
    value: '',
  })

  const handleSave = () => {
    const nextErrors = {
      field: criterion.field ? '' : 'Lead Field is required.',
      operator: criterion.operator ? '' : 'Operator is required.',
      value: criterion.value.trim() ? '' : 'Value List is required.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSave({ ...criterion, value: criterion.value.trim() })
    onClose()
  }

  const dialogTitle =
    criterion.type === 'Lead Field' || criterion.type === 'Field Value'
      ? 'Lead Field Criteria'
      : `${criterion.type} Criteria`

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showClose={false}
        className="max-w-[620px] gap-0 overflow-hidden p-0 shadow-panel"
      >
        <DialogPanelHeader
          title={dialogTitle}
          onClose={onClose}
        />
        <DialogDescription className="sr-only">
          Configure a field rule that controls which leads qualify for this Delivery Account.
        </DialogDescription>

        <div className="grid gap-4 px-5 py-5">
          <FieldGroup label="Lead Field">
            <Select
              value={criterion.field}
              onValueChange={(field) => {
                setCriterion((current) => ({
                  ...current,
                  field,
                  operator: field === 'State' ? 'Is Any Of' : '',
                  value: '',
                }))
                setErrors({ field: '', operator: '', value: '' })
              }}
            >
              <SelectTrigger aria-label="Lead Field" aria-invalid={Boolean(errors.field)}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Source">Lead Source</SelectItem>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="Postal Code">Postal Code</SelectItem>
                <SelectItem value="Loan Amount">Loan Amount</SelectItem>
                <SelectItem value="Credit Rating">Credit Rating</SelectItem>
                <SelectItem value="Property Type">Property Type</SelectItem>
              </SelectContent>
            </Select>
            {errors.field && <p className="mt-1 text-xs text-destructive">{errors.field}</p>}
          </FieldGroup>

          <FieldGroup label="Operator">
            <Select
              value={criterion.operator}
              onValueChange={(operator) => {
                setCriterion((current) => ({ ...current, operator }))
                setErrors((current) => ({ ...current, operator: '' }))
              }}
            >
              <SelectTrigger aria-label="Operator" aria-invalid={Boolean(errors.operator)}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {criterion.field === 'State' ? (
                  <SelectItem value="Is Any Of">Is Any Of</SelectItem>
                ) : (
                  <>
                    <SelectItem value="In">In</SelectItem>
                    <SelectItem value="Not In">Not In</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.operator && <p className="mt-1 text-xs text-destructive">{errors.operator}</p>}
          </FieldGroup>

          <FieldGroup label="Value List">
            {criterion.field === 'State' ? (
              <MultiSelect
                options={STATE_OPTIONS}
                value={criterion.value
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean)}
                onValueChange={(values) => {
                  setCriterion((current) => ({ ...current, value: values.join(', ') }))
                  setErrors((current) => ({ ...current, value: '' }))
                }}
                placeholder="Select..."
                ariaLabel="Value List"
                ariaInvalid={Boolean(errors.value)}
                searchInTrigger
                commitOnConfirm={false}
                maxVisibleChips={4}
              />
            ) : (
              <Input
                aria-label="Value List"
                value={criterion.value}
                placeholder="Select..."
                aria-invalid={Boolean(errors.value)}
                onChange={(event) => {
                  setCriterion((current) => ({ ...current, value: event.target.value }))
                  setErrors((current) => ({ ...current, value: '' }))
                }}
              />
            )}
            {errors.value && <p className="mt-1 text-xs text-destructive">{errors.value}</p>}
          </FieldGroup>
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
