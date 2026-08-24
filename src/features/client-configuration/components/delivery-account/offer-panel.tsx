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

type OfferSettings = ClientConfiguration['deliveryAccount']['offer']

interface OfferPanelProps {
  value: OfferSettings
  onChange: (partial: Partial<OfferSettings>) => void
}

export function OfferPanel({ value, onChange }: OfferPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SwitchField
        label="Offer Enabled"
        description="Include an offer in this Delivery Account's outbound response."
        checked={value.enabled}
        onCheckedChange={(enabled) => onChange({ enabled })}
      >
        <FieldGroup label="Offer Type">
          <Select value={value.type} onValueChange={() => onChange({ type: 'static' })}>
            <SelectTrigger aria-label="Offer Type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static Offer</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </SwitchField>
      <FieldGroup label="Company Name">
        <Input aria-label="Offer Company Name" value={value.companyName} onChange={(event) => onChange({ companyName: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Company Phone Number">
        <Input aria-label="Offer Company Phone Number" value={value.companyPhoneNumber} onChange={(event) => onChange({ companyPhoneNumber: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Name">
        <Input aria-label="Offer Name" value={value.name} onChange={(event) => onChange({ name: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Description">
        <Textarea aria-label="Offer Description" value={value.description} onChange={(event) => onChange({ description: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="URL">
        <Input aria-label="Offer URL" value={value.url} onChange={(event) => onChange({ url: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Image URL">
        <Input aria-label="Offer Image URL" value={value.imageUrl} onChange={(event) => onChange({ imageUrl: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Privacy URL">
        <Input aria-label="Offer Privacy URL" value={value.privacyUrl} onChange={(event) => onChange({ privacyUrl: event.target.value })} />
      </FieldGroup>
      <FieldGroup label="Terms URL">
        <Input aria-label="Offer Terms URL" value={value.termsUrl} onChange={(event) => onChange({ termsUrl: event.target.value })} />
      </FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Duration">
          <Select
            value={value.duration}
            onValueChange={(duration) => onChange({ duration: duration as OfferSettings['duration'] })}
          >
            <SelectTrigger aria-label="Offer Duration"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="One Time">One Time</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
        <FieldGroup label="Amount">
          <Input
            aria-label="Offer Amount"
            type="number"
            min="0"
            step="0.01"
            value={value.amount}
            onChange={(event) => onChange({ amount: Number(event.target.value) || 0 })}
          />
        </FieldGroup>
      </div>
      <Separator />
      <SwitchField
        label="Custom TCPA Consent Text"
        description="Override the default consent language shown with this offer."
        checked={value.customTcpaConsentEnabled}
        onCheckedChange={(customTcpaConsentEnabled) => onChange({ customTcpaConsentEnabled })}
      >
        <Textarea
          aria-label="Custom TCPA Consent Text"
          value={value.customTcpaConsentText}
          onChange={(event) => onChange({ customTcpaConsentText: event.target.value })}
        />
      </SwitchField>
    </div>
  )
}
