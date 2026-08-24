import {
  FieldGroup,
  Input,
  MultiSelect,
  SectionHeading,
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
  'No Delivery',
  'HTTP Webhook',
  'ClickPoint Integration',
  'Email Delivery',
  'CSV Attachment',
  'Lead Portal',
  'PING/POST Delivery',
]

const orderForms = [
  { value: 'Mortgage Lead Order', label: 'Mortgage Lead Order' },
  { value: 'Home Services Order', label: 'Home Services Order' },
  { value: 'Insurance Lead Order', label: 'Insurance Lead Order' },
]

function DeliveryMethodSelect({
  label,
  value,
  onValueChange,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <FieldGroup label={label}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          {deliveryMethods.map((method) => (
            <SelectItem key={method} value={method}>{method}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldGroup>
  )
}

export function DeliveryPanel({ value, onChange }: DeliveryPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Primary Delivery" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Automated Delivery"
        description="Deliver leads automatically."
        checked={value.automatedDelivery}
        onCheckedChange={(automatedDelivery) => onChange({ automatedDelivery })}
      />
      <DeliveryMethodSelect
        label="Primary Delivery Method"
        value={value.primaryDeliveryMethod}
        onValueChange={(primaryDeliveryMethod) => onChange({ primaryDeliveryMethod })}
      />

      <SectionHeading title="Additional Delivery" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Additional Delivery Method #1"
        description="Trigger an additional delivery alongside the primary delivery."
        checked={value.additionalDeliveryMethod1Enabled}
        onCheckedChange={(additionalDeliveryMethod1Enabled) => onChange({ additionalDeliveryMethod1Enabled })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeliveryMethodSelect
            label="Delivery Method"
            value={value.additionalDeliveryMethod1}
            onValueChange={(additionalDeliveryMethod1) => onChange({ additionalDeliveryMethod1 })}
          />
          <FieldGroup label="When primary delivery fails">
            <Select
              value={value.additionalDeliveryMethod1Fallback}
              onValueChange={(additionalDeliveryMethod1Fallback) => onChange({ additionalDeliveryMethod1Fallback })}
            >
              <SelectTrigger aria-label="Additional Delivery Method #1 fallback"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Do not send if primary fails">Do not send if primary fails</SelectItem>
                <SelectItem value="Send if primary fails">Send if primary fails</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      </SwitchField>
      <Separator />
      <SwitchField
        label="Additional Delivery Method #2"
        description="Trigger a second additional delivery alongside the primary delivery."
        checked={value.additionalDeliveryMethod2Enabled}
        onCheckedChange={(additionalDeliveryMethod2Enabled) => onChange({ additionalDeliveryMethod2Enabled })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeliveryMethodSelect
            label="Delivery Method"
            value={value.additionalDeliveryMethod2}
            onValueChange={(additionalDeliveryMethod2) => onChange({ additionalDeliveryMethod2 })}
          />
          <FieldGroup label="When primary delivery fails">
            <Select
              value={value.additionalDeliveryMethod2Fallback}
              onValueChange={(additionalDeliveryMethod2Fallback) => onChange({ additionalDeliveryMethod2Fallback })}
            >
              <SelectTrigger aria-label="Additional Delivery Method #2 fallback"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Do not send if primary fails">Do not send if primary fails</SelectItem>
                <SelectItem value="Send if primary fails">Send if primary fails</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      </SwitchField>

      <SectionHeading title="Delivery Options" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <FieldGroup label="Delivery Priority" description="Order of priority when automation is set to priority.">
        <Input
          aria-label="Delivery Priority"
          type="number"
          min="0"
          value={value.priority}
          onChange={(event) => onChange({ priority: Number(event.target.value) || 0 })}
        />
      </FieldGroup>
      <SwitchField
        label="Exclusive Delivery"
        description="Make leads sent to this Delivery Account exclusive."
        checked={value.exclusiveDelivery}
        onCheckedChange={(exclusiveDelivery) => onChange({ exclusiveDelivery })}
      />

      <SectionHeading title="Order Options" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Use Order System"
        description="Only deliver leads when an active order is available."
        checked={value.useOrderSystem}
        onCheckedChange={(useOrderSystem) => onChange({ useOrderSystem })}
      />
      <FieldGroup
        label="Order Forms"
        description="Choose which forms are available when creating an order from the client portal."
      >
        <MultiSelect
          options={orderForms}
          value={value.orderForms}
          onValueChange={(nextOrderForms) => onChange({ orderForms: nextOrderForms })}
          placeholder="Select order forms"
        />
      </FieldGroup>
    </div>
  )
}
