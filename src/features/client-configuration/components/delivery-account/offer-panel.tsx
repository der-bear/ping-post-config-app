import { FieldGroup, Input, SwitchField } from '@/components/ui'

import type { ClientConfiguration } from '../../types'

type OfferSettings = ClientConfiguration['deliveryAccount']['offer']

interface OfferPanelProps {
  value: OfferSettings
  onChange: (partial: Partial<OfferSettings>) => void
}

export function OfferPanel({ value, onChange }: OfferPanelProps) {
  return (
    <SwitchField
      label="Offer Enabled"
      description="Include a buyer offer amount in this Delivery Account's outbound response."
      checked={value.enabled}
      onCheckedChange={(enabled) => onChange({ enabled })}
    >
      <div className="grid gap-4 pt-1 sm:grid-cols-3">
        <FieldGroup label="Offer Amount">
          <Input
            aria-label="Offer Amount"
            type="number"
            min="0"
            step="0.01"
            value={value.amount}
            onChange={(event) => onChange({ amount: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
        <FieldGroup label="Minimum Offer">
          <Input
            aria-label="Minimum Offer"
            type="number"
            min="0"
            step="0.01"
            value={value.minimum}
            onChange={(event) => onChange({ minimum: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
        <FieldGroup label="Maximum Offer">
          <Input
            aria-label="Maximum Offer"
            type="number"
            min="0"
            step="0.01"
            value={value.maximum}
            onChange={(event) => onChange({ maximum: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
      </div>
    </SwitchField>
  )
}
