import {
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

export function OrderGeneralPanel({ value, onChange }: OrderGeneralPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Order Name" required>
        <Input
          aria-label="Order Name"
          value={value.name}
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Start Date">
          <Input
            aria-label="Start Date"
            type="date"
            value={value.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
        </FieldGroup>
        <FieldGroup label="End Date" description="Optional">
          <Input
            aria-label="End Date"
            type="date"
            value={value.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
        </FieldGroup>
      </div>
      <Separator />
      <SwitchField
        label="Renew Order"
        description="Automatically create a replacement when this order completes."
        checked={value.renewOrder}
        onCheckedChange={(renewOrder) => onChange({ renewOrder })}
      />
      <Separator />
      <SwitchField
        label="Auto Charge"
        description="Configuration preview only; no payment transaction is performed."
        checked={value.autoCharge}
        onCheckedChange={(autoCharge) => onChange({ autoCharge })}
      />
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Payment Discount" description="Configuration only">
          <Input
            aria-label="Payment Discount"
            type="number"
            min="0"
            value={value.paymentDiscount}
            onChange={(event) => onChange({ paymentDiscount: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
        <FieldGroup label="Max Return Percentage">
          <Input
            aria-label="Max Return Percentage"
            type="number"
            min="0"
            max="100"
            value={value.maxReturnPercentage}
            onChange={(event) => onChange({ maxReturnPercentage: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
      </div>
    </div>
  )
}
