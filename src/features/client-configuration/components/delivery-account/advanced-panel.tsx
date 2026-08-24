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

export function AdvancedPanel({ value, onChange }: AdvancedPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Account" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Maximum Return Percentage"
        description="Maximum percentage of delivered leads that can be returned."
        checked={value.maximumReturnPercentageEnabled}
        onCheckedChange={(maximumReturnPercentageEnabled) => onChange({ maximumReturnPercentageEnabled })}
      >
        <Input
          aria-label="Maximum Return Percentage"
          type="number"
          min="0"
          max="100"
          value={value.maximumReturnPercentage}
          onChange={(event) => onChange({ maximumReturnPercentage: Number(event.target.value) || 0 })}
        />
      </SwitchField>
      <Separator />
      <SwitchField
        label="Enforce Quantity Constraints"
        description="Rescan for another Delivery Account when this one reaches its delivery limit."
        checked={value.enforceQuantityConstraints}
        onCheckedChange={(enforceQuantityConstraints) => onChange({ enforceQuantityConstraints })}
      />
      <Separator />
      <SwitchField
        label="Limit by Percentage of Qualified Leads"
        description="Limit the amount of leads delivered based on the percentage that qualify."
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
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Qualified Lead Percentage">
            <Input
              aria-label="Qualified Lead Percentage"
              type="number"
              min="0"
              max="100"
              value={value.qualifiedLeadPercentage}
              onChange={(event) => onChange({ qualifiedLeadPercentage: Number(event.target.value) || 0 })}
            />
          </FieldGroup>
        </div>
      </SwitchField>

      <SectionHeading title="Delivery" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      <SwitchField
        label="Delivery Delay"
        description="Hold the lead for a specified number of seconds before delivery."
        checked={value.deliveryDelayEnabled}
        onCheckedChange={(deliveryDelayEnabled) => onChange({ deliveryDelayEnabled })}
      >
        <Input
          aria-label="Delivery Delay Seconds"
          type="number"
          min="0"
          value={value.deliveryDelaySeconds}
          onChange={(event) => onChange({ deliveryDelaySeconds: Number(event.target.value) || 0 })}
        />
      </SwitchField>
      <FieldGroup
        label="Delivery Group"
        description="Specify which delivery group this Delivery Account is assigned to."
      >
        <Select value={value.deliveryGroup} onValueChange={(deliveryGroup) => onChange({ deliveryGroup })}>
          <SelectTrigger aria-label="Delivery Group"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="No Delivery Group">No Delivery Group</SelectItem>
            <SelectItem value="Mortgage Buyers">Mortgage Buyers</SelectItem>
            <SelectItem value="Priority Delivery">Priority Delivery</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup
        label="Delivery Parameters"
        description="Override or append values to the selected primary delivery method."
      >
        <div className="overflow-hidden rounded-[4px] border border-border">
          <div className="grid grid-cols-2 border-b border-border bg-muted px-3 py-2 text-xs font-semibold">
            <span>Name</span>
            <span>Value</span>
          </div>
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">No delivery parameters</p>
        </div>
      </FieldGroup>
      <p className="text-xs italic text-muted-foreground">Note: Delivery parameter changes save automatically</p>
      <Separator />
      <SwitchField
        label="Confirm Delivery"
        description="Set the delivery price to $0.00 until the delivery has been confirmed."
        checked={value.confirmDelivery}
        onCheckedChange={(confirmDelivery) => onChange({ confirmDelivery })}
      />
    </div>
  )
}
