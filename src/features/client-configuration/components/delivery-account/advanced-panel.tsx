import { FieldGroup, Input, Separator, SwitchField } from '@/components/ui'

import type { ClientConfiguration } from '../../types'

type AdvancedSettings = ClientConfiguration['deliveryAccount']['advanced']

interface AdvancedPanelProps {
  value: AdvancedSettings
  onChange: (partial: Partial<AdvancedSettings>) => void
}

export function AdvancedPanel({ value, onChange }: AdvancedPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SwitchField
        label="Exclusive"
        description="Reserve leads delivered through this account for this client."
        checked={value.exclusive}
        onCheckedChange={(exclusive) => onChange({ exclusive })}
      />
      <Separator />
      <SwitchField
        label="Require Order"
        description="Allow delivery only while an eligible client order is active."
        checked={value.requireOrder}
        onCheckedChange={(requireOrder) => onChange({ requireOrder })}
      />
      <Separator />
      <SwitchField
        label="Require Criteria"
        description="Require at least one delivery criterion before the account can receive leads."
        checked={value.criteriaRequired}
        onCheckedChange={(criteriaRequired) => onChange({ criteriaRequired })}
      />
      <Separator />
      <SwitchField
        label="Limit by Percentage of Qualified Leads"
        description="Deliver only a controlled percentage of leads that qualify for this account."
        checked={value.limitByQualifiedLeadPercentage}
        onCheckedChange={(limitByQualifiedLeadPercentage) => onChange({ limitByQualifiedLeadPercentage })}
      >
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
      </SwitchField>
      <Separator />
      <SwitchField
        label="Notify when a delivered lead is removed"
        description="Email a client contact when a previously delivered lead is removed."
        checked={value.notifyOnRemoval}
        onCheckedChange={(notifyOnRemoval) => onChange({ notifyOnRemoval })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Removal Contact Name">
            <Input
              aria-label="Removal Contact Name"
              value={value.removalContactName}
              onChange={(event) => onChange({ removalContactName: event.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="Removal Contact Email">
            <Input
              aria-label="Removal Contact Email"
              type="email"
              value={value.removalContactEmail}
              onChange={(event) => onChange({ removalContactEmail: event.target.value })}
            />
          </FieldGroup>
        </div>
      </SwitchField>
    </div>
  )
}
