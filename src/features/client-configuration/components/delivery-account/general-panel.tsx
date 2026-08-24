import {
  FieldGroup,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'

import type { ClientConfiguration } from '../../types'

type DeliveryAccount = ClientConfiguration['deliveryAccount']

interface GeneralPanelProps {
  value: DeliveryAccount
  onChange: (partial: Partial<DeliveryAccount>) => void
}

export function GeneralPanel({ value, onChange }: GeneralPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Delivery Account Name" required>
        <Input
          aria-label="Delivery Account Name"
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </FieldGroup>

      <FieldGroup label="Lead Type">
        <Select value={value.leadType} onValueChange={(leadType) => onChange({ leadType })}>
          <SelectTrigger aria-label="Lead Type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Short Mortgage Lead">Short Mortgage Lead</SelectItem>
            <SelectItem value="Auto Insurance Lead">Auto Insurance Lead</SelectItem>
            <SelectItem value="Home Services Lead">Home Services Lead</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Channel">
          <Select value={value.channel} onValueChange={(channel) => onChange({ channel })}>
            <SelectTrigger aria-label="Channel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Web and Chat Leads">Web and Chat Leads</SelectItem>
              <SelectItem value="Phone Leads">Phone Leads</SelectItem>
              <SelectItem value="All Leads">All Leads</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
        <FieldGroup label="Status">
          <Select
            value={value.status}
            onValueChange={(status) => onChange({ status: status as DeliveryAccount['status'] })}
          >
            <SelectTrigger aria-label="Delivery Account Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>

      <Separator />

      <FieldGroup
        label="Default Lead Price"
        description="The fallback price used when an order item does not override it."
      >
        <Input
          aria-label="Default Lead Price"
          type="number"
          min="0"
          step="0.01"
          value={value.defaultLeadPrice}
          onChange={(event) => onChange({ defaultLeadPrice: Number(event.target.value) || 0 })}
        />
      </FieldGroup>
    </div>
  )
}
