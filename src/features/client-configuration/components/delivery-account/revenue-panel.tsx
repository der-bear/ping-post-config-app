import { FieldGroup, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SwitchField } from '@/components/ui'

import type { ClientConfiguration } from '../../types'

type RevenueSettings = ClientConfiguration['deliveryAccount']['revenue']

interface RevenuePanelProps {
  value: RevenueSettings
  onChange: (partial: Partial<RevenueSettings>) => void
}

export function RevenuePanel({ value, onChange }: RevenuePanelProps) {
  return (
    <SwitchField
      label="Revenue Enabled"
      description="Record revenue when a lead is delivered through this account."
      checked={value.enabled}
      onCheckedChange={(enabled) => onChange({ enabled })}
    >
      <div className="grid gap-4 pt-1 sm:grid-cols-2">
        <FieldGroup label="Revenue Type">
          <Select
            value={value.type}
            onValueChange={(type) => onChange({ type: type as RevenueSettings['type'] })}
          >
            <SelectTrigger aria-label="Revenue Type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
        {value.type === 'fixed' ? (
          <FieldGroup label="Revenue Amount">
            <Input
              aria-label="Revenue Amount"
              type="number"
              min="0"
              step="0.01"
              value={value.amount}
              onChange={(event) => onChange({ amount: Number(event.target.value) || 0 })}
            />
          </FieldGroup>
        ) : (
          <FieldGroup label="Revenue Percentage">
            <Input
              aria-label="Revenue Percentage"
              type="number"
              min="0"
              max="100"
              value={value.percentage}
              onChange={(event) => onChange({ percentage: Number(event.target.value) || 0 })}
            />
          </FieldGroup>
        )}
      </div>
    </SwitchField>
  )
}
