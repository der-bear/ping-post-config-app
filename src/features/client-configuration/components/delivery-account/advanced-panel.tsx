import {
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

import type { ClientConfiguration } from '../../types'

type AdvancedSettings = ClientConfiguration['deliveryAccount']['advanced']

interface AdvancedPanelProps {
  value: AdvancedSettings
  onChange: (partial: Partial<AdvancedSettings>) => void
}

const parseNumber = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0

export function AdvancedPanel({ value, onChange }: AdvancedPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Account" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Maximum Return Percentage"
        description="The maximum amount of leads (in percentage received) that can be returned"
        checked={value.maximumReturnPercentageEnabled}
        onCheckedChange={(maximumReturnPercentageEnabled) => onChange({ maximumReturnPercentageEnabled })}
      >
        <Input
          aria-label="Maximum Return Percentage"
          inputMode="decimal"
          value={`${value.maximumReturnPercentage.toFixed(2)}%`}
          onChange={(event) => onChange({ maximumReturnPercentage: parseNumber(event.target.value) })}
        />
      </SwitchField>
      <Separator className="my-0" />
      <SwitchField
        label="Enforce Quantity Constraints"
        description="In the event that a lead isn't delivered due to all delivery accounts being over their maximum delivery, this option will allow the system to rescan and ignore quantity limits to ensure the lead is delivered."
        checked={value.enforceQuantityConstraints}
        onCheckedChange={(enforceQuantityConstraints) => onChange({ enforceQuantityConstraints })}
      />
      <Separator className="my-0" />
      <SwitchField
        label="Limit by Percentage of Qualified Leads"
        description="This setting will limit the amount of leads delivered to this delivery account based on the percentage of leads that qualify."
        checked={value.limitByQualifiedLeadPercentage}
        onCheckedChange={(limitByQualifiedLeadPercentage) => onChange({ limitByQualifiedLeadPercentage })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Limit Period">
            <Select
              value={value.qualifiedLeadLimitMode}
              onValueChange={(qualifiedLeadLimitMode) => onChange({ qualifiedLeadLimitMode: qualifiedLeadLimitMode as AdvancedSettings['qualifiedLeadLimitMode'] })}
            >
              <SelectTrigger aria-label="Qualified Lead Limit Period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Total">Total</SelectItem>
                <SelectItem value="Hour">Hour</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Year">Year</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Qualified Lead Percentage">
            <Input
              aria-label="Qualified Lead Percentage"
              inputMode="decimal"
              value={`${value.qualifiedLeadPercentage}%`}
              onChange={(event) => onChange({ qualifiedLeadPercentage: parseNumber(event.target.value) })}
            />
          </FieldGroup>
        </div>
      </SwitchField>

      <SectionHeading title="Delivery" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Delivery Delay"
        description="Should the lead be held for a certain amount of time before it is delivered."
        checked={value.deliveryDelayEnabled}
        onCheckedChange={(deliveryDelayEnabled) => onChange({ deliveryDelayEnabled })}
      >
        <Input
          aria-label="Delivery Delay Seconds"
          inputMode="numeric"
          value={`${value.deliveryDelaySeconds} (seconds)`}
          onChange={(event) => onChange({ deliveryDelaySeconds: parseNumber(event.target.value) })}
        />
      </SwitchField>
      <FieldGroup
        label="Delivery Group"
        description="When using tiered delivery, this setting allows you to specify which delivery group this delivery account is assigned to"
      >
        <Select value={value.deliveryGroup} onValueChange={(deliveryGroup) => onChange({ deliveryGroup })}>
          <SelectTrigger aria-label="Delivery Group"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="No Delivery Group">No Delivery Group</SelectItem>
            <SelectItem value="LEO priority group">LEO priority group</SelectItem>
            <SelectItem value="LeadPointMax">LeadPointMax</SelectItem>
            <SelectItem value="Priority 1">Priority 1</SelectItem>
            <SelectItem value="CBA New High Priority">CBA New High Priority</SelectItem>
            <SelectItem value="Weighted CA Leads">Weighted CA Leads</SelectItem>
            <SelectItem value="Weighted 2 AZ Leads">Weighted 2 AZ Leads</SelectItem>
            <SelectItem value="Weighted 3 LA Leads">Weighted 3 LA Leads</SelectItem>
            <SelectItem value="Round Robin">Round Robin</SelectItem>
            <SelectItem value="Prod test">Prod test</SelectItem>
            <SelectItem value="Priority 8">Priority 8</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup
        label="Delivery Parameters"
        description="These settings are used to override or append values to the delivery method selected when executing the primary delivery"
      >
        <div className="overflow-hidden rounded-[4px] border border-border">
          <div className="grid grid-cols-2 border-b border-border bg-muted px-3 py-2 text-xs font-semibold">
            <span>Name</span>
            <span>Value</span>
          </div>
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">No Parameters</p>
        </div>
      </FieldGroup>
      <p className="text-xs italic text-muted-foreground">Note: Delivery parameter changes save automatically</p>
      <Separator className="my-0" />
      <SwitchField
        label="Confirm Delivery"
        description="Set the delivery price to $0.00 until delivery has been confirmed. (API Call is Required)"
        checked={value.confirmDelivery}
        onCheckedChange={(confirmDelivery) => onChange({ confirmDelivery })}
      />
    </div>
  )
}
