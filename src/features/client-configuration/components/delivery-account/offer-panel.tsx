import {
  DateInput,
  FieldGroup,
  Input,
  SectionHeading,
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

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const parseNumber = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0

export function OfferPanel({ value, onChange }: OfferPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SwitchField
        label="Offer Enabled"
        checked={value.enabled}
        onCheckedChange={(enabled) => onChange({ enabled })}
      />
      <Select
        value={value.type}
        onValueChange={(type) => onChange({ type: type as OfferSettings['type'] })}
      >
        <SelectTrigger aria-label="Offer Source"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="static">Static Offer</SelectItem>
          <SelectItem value="dynamic">Dynamic</SelectItem>
        </SelectContent>
      </Select>
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
        <Input aria-label="Offer Description" value={value.description} onChange={(event) => onChange({ description: event.target.value })} />
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
      <FieldGroup label="Duration">
        <Select
          value={value.duration}
          onValueChange={(duration) => onChange({ duration: duration as OfferSettings['duration'] })}
        >
          <SelectTrigger aria-label="Offer Duration"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Amount">
        <Input
          aria-label="Offer Amount"
          inputMode="decimal"
          value={currency(value.amount)}
          onChange={(event) => onChange({ amount: parseNumber(event.target.value) })}
        />
      </FieldGroup>
      <SwitchField
        label="Custom TCPA Consent Text"
        checked={value.customTcpaConsentEnabled}
        onCheckedChange={(customTcpaConsentEnabled) => onChange({ customTcpaConsentEnabled })}
      >
        <Textarea
          aria-label="Custom TCPA Consent Text"
          value={value.customTcpaConsentText}
          onChange={(event) => onChange({ customTcpaConsentText: event.target.value })}
        />
      </SwitchField>
      <Separator className="my-0" />
      <SectionHeading
        title="Schedule"
        size="sm"
        className="rounded-[4px] bg-muted px-3 py-2"
      />
      <FieldGroup label="Time Zone">
        <Select value={value.timeZone} onValueChange={(timeZone) => onChange({ timeZone })}>
          <SelectTrigger aria-label="Offer Time Zone"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Europe/Kiev">Europe - Kiev</SelectItem>
            <SelectItem value="America/New_York">America - New York</SelectItem>
            <SelectItem value="America/Chicago">America - Chicago</SelectItem>
            <SelectItem value="America/Denver">America - Denver</SelectItem>
            <SelectItem value="America/Phoenix">America - Phoenix</SelectItem>
            <SelectItem value="America/Los_Angeles">America - Los Angeles</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <SwitchField
        label="Start Date"
        checked={value.hasStartDate}
        onCheckedChange={(hasStartDate) => onChange({ hasStartDate })}
      >
        <DateInput
          aria-label="Offer Start Date"
          value={value.startDate}
          pickerLabel="Choose Offer Start Date"
          onValueChange={(startDate) => onChange({ startDate })}
        />
      </SwitchField>
      <SwitchField
        label="End Date"
        checked={value.hasEndDate}
        onCheckedChange={(hasEndDate) => onChange({ hasEndDate })}
      >
        <DateInput
          aria-label="Offer End Date"
          value={value.endDate}
          pickerLabel="Choose Offer End Date"
          onValueChange={(endDate) => onChange({ endDate })}
        />
      </SwitchField>
    </div>
  )
}
