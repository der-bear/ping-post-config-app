import {
  DateInput,
  FieldGroup,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SwitchField,
} from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'

import type { ClientConfiguration } from '../../types'

type Order = ClientConfiguration['order']

interface OrderGeneralPanelProps {
  value: Order
  onChange: (partial: Partial<Omit<Order, 'items'>>) => void
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const parseNumber = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0

export function OrderGeneralPanel({ value, onChange }: OrderGeneralPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Name">
        <Input
          aria-label="Name"
          value={value.name}
          placeholder="Required"
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </FieldGroup>
      <FieldGroup label="Description">
        <Textarea
          aria-label="Description"
          value={value.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </FieldGroup>
      <FieldGroup label="Status">
        <Select
          value={value.status}
          onValueChange={(status) => onChange({ status: status as Order['status'] })}
        >
          <SelectTrigger aria-label="Order Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Start Date">
          <DateInput
            aria-label="Start Date"
            value={value.startDate}
            pickerLabel="Choose Start Date"
            onValueChange={(startDate) => onChange({ startDate })}
          />
        </FieldGroup>
        <SwitchField
          label="End Date"
          description="Should this order end on a specific date?"
          checked={Boolean(value.endDate)}
          onCheckedChange={(enabled) => onChange({ endDate: enabled ? value.startDate : '' })}
        >
          <DateInput
            aria-label="End Date"
            value={value.endDate}
            pickerLabel="Choose End Date"
            onValueChange={(endDate) => onChange({ endDate })}
          />
        </SwitchField>
      </div>
      <Separator className="my-0" />
      <SwitchField
        label="Renew Order"
        description="Automatically renew this order when complete."
        checked={value.renewOrder}
        onCheckedChange={(renewOrder) => onChange({ renewOrder })}
      />
      <Separator className="my-0" />
      <SwitchField
        label="Auto Charge"
        description="Automatically charge order based on initial charge or when the order is complete."
        checked={value.autoCharge}
        onCheckedChange={(autoCharge) => onChange({ autoCharge })}
      >
        <Select
          value={value.autoChargeTiming}
          onValueChange={(autoChargeTiming) => onChange({
            autoChargeTiming: autoChargeTiming as Order['autoChargeTiming'],
          })}
        >
          <SelectTrigger aria-label="Auto Charge Timing"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Charge before order starts">Charge before order starts</SelectItem>
            <SelectItem value="Charge when order is complete">Charge when order is complete</SelectItem>
          </SelectContent>
        </Select>
      </SwitchField>
      <Separator className="my-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup
          label="Payment Discount"
          description="This amount will be deducted from the total amount due when payments are processed."
        >
          <Input
            aria-label="Payment Discount"
            inputMode="decimal"
            value={currency(value.paymentDiscount)}
            onChange={(event) => onChange({ paymentDiscount: parseNumber(event.target.value) })}
          />
        </FieldGroup>
        <SwitchField
          label="Max Return Percentage"
          description="Should returns be limited to the specified percentage?"
          checked={value.maxReturnPercentageEnabled}
          onCheckedChange={(maxReturnPercentageEnabled) => onChange({
            maxReturnPercentageEnabled,
          })}
        >
          <Input
            aria-label="Max Return Percentage"
            inputMode="decimal"
            value={`${value.maxReturnPercentage}%`}
            onChange={(event) => onChange({ maxReturnPercentage: parseNumber(event.target.value) })}
          />
        </SwitchField>
      </div>
    </div>
  )
}
