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

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const parseNumber = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0

export function GeneralPanel({ value, onChange }: GeneralPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Delivery Account Name">
        <Input
          aria-label="Delivery Account Name"
          value={value.name}
          placeholder="Example: Semi-exclusive leads in California"
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

      <FieldGroup label="Channel">
        <Select value={value.channel} onValueChange={(channel) => onChange({ channel })}>
          <SelectTrigger aria-label="Channel"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Web and Chat Leads">Web and Chat Leads</SelectItem>
            <SelectItem value="URL Redirect">URL Redirect</SelectItem>
            <SelectItem value="Live Call Transfers">Live Call Transfers</SelectItem>
            <SelectItem value="Phone Routing">Phone Routing</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Status" description="Select the current status">
        <Select
          value={value.status}
          onValueChange={(status) => onChange({ status: status as DeliveryAccount['status'] })}
        >
          <SelectTrigger aria-label="Delivery Account Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="open">Open</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator className="my-0" />

      <FieldGroup
        label="Default Lead Price"
        description="Price for each lead sent"
      >
        <Input
          aria-label="Default Lead Price"
          inputMode="decimal"
          value={currency(value.defaultLeadPrice)}
          onChange={(event) => onChange({ defaultLeadPrice: parseNumber(event.target.value) })}
        />
      </FieldGroup>
    </div>
  )
}
