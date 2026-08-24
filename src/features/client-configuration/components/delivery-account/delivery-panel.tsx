import {
  FieldGroup,
  Input,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SwitchField,
} from '@/components/ui'

import type { ClientConfiguration } from '../../types'

type DeliverySettings = ClientConfiguration['deliveryAccount']['delivery']

interface DeliveryPanelProps {
  value: DeliverySettings
  onChange: (partial: Partial<DeliverySettings>) => void
}

const deliveryMethods = [
  { value: 'HTTP Webhook', label: 'HTTP Webhook' },
  { value: 'ClickPoint Integration', label: 'ClickPoint Integration' },
  { value: 'Email Delivery', label: 'Email Delivery' },
  { value: 'CSV Attachment', label: 'CSV Attachment' },
  { value: 'Lead Portal', label: 'Lead Portal' },
  { value: 'PING/POST Delivery', label: 'PING/POST Delivery' },
]

export function DeliveryPanel({ value, onChange }: DeliveryPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SwitchField
        label="Automated Delivery"
        description="Automatically send qualified leads to the primary delivery method."
        checked={value.automatedDelivery}
        onCheckedChange={(automatedDelivery) => onChange({ automatedDelivery })}
      />
      <Separator />
      <FieldGroup label="Primary Delivery Method">
        <Select
          value={value.primaryDeliveryMethod}
          onValueChange={(primaryDeliveryMethod) => onChange({ primaryDeliveryMethod })}
        >
          <SelectTrigger aria-label="Primary Delivery Method"><SelectValue /></SelectTrigger>
          <SelectContent>
            {deliveryMethods.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup
        label="Additional Delivery Methods"
        description="Optional fallback or notification methods used alongside the primary method."
      >
        <MultiSelect
          options={deliveryMethods}
          value={value.additionalDeliveryMethods}
          onValueChange={(additionalDeliveryMethods) => onChange({ additionalDeliveryMethods })}
          placeholder="Select additional methods"
        />
      </FieldGroup>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Delivery Priority">
          <Input
            aria-label="Delivery Priority"
            type="number"
            min="0"
            value={value.priority}
            onChange={(event) => onChange({ priority: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
        <FieldGroup label="Delivery Group">
          <Select value={value.group} onValueChange={(group) => onChange({ group })}>
            <SelectTrigger aria-label="Delivery Group"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No Delivery Group">No Delivery Group</SelectItem>
              <SelectItem value="Mortgage Buyers">Mortgage Buyers</SelectItem>
              <SelectItem value="Priority Delivery">Priority Delivery</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
      <FieldGroup label="User Assigned">
        <Select value={value.assignedUser} onValueChange={(assignedUser) => onChange({ assignedUser })}>
          <SelectTrigger aria-label="User Assigned"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ClickPoint.Sales">ClickPoint.Sales</SelectItem>
            <SelectItem value="Demo.Administrator">Demo.Administrator</SelectItem>
            <SelectItem value="Client.Success">Client.Success</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
    </div>
  )
}
