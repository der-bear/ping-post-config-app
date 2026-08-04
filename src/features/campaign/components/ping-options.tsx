import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { DataGrid } from '@/components/data-grid'
import { DataGridToolbar, ToolbarAction } from '@/components/data-grid/data-grid-toolbar'
import type { DataGridColumn } from '@/components/data-grid/types'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SwitchField } from '@/components/ui/switch-field'
import { SectionHeading } from '@/components/ui/field-group'
import { useCampaignStore } from '../store'
import type { PingFieldRequirement, PingOptionsConfig, PingRequirementValue } from '../types'
import { PingRequiredFieldDialog } from './ping-required-field-dialog'

const fieldColumns: DataGridColumn<PingFieldRequirement>[] = [
  { key: 'field', header: 'Field', width: '80%' },
  { key: 'type', header: 'Type', width: '20%' },
]

type ValueRequirementKey = Exclude<
  keyof PingOptionsConfig,
  'qualifyAllCriteria' | 'fieldRequirements'
>

interface RequirementRowProps {
  configKey: ValueRequirementKey
  label: string
  helper: string
}

function RequirementRow({ configKey, label, helper }: RequirementRowProps) {
  const requirement = useCampaignStore((state) => state.config.pingOptions[configKey])
  const updatePingOptions = useCampaignStore((state) => state.updatePingOptions)

  const updateRequirement = (partial: Partial<PingRequirementValue>) => {
    updatePingOptions({
      [configKey]: { ...requirement, ...partial },
    })
  }

  return (
    <SwitchField
      label={label}
      description={helper}
      checked={requirement.enabled}
      onCheckedChange={(enabled) => updateRequirement({ enabled })}
    >
      <Input
        aria-label={`${label} value`}
        value={requirement.value}
        disabled={!requirement.enabled}
        onChange={(event) => updateRequirement({ value: event.target.value })}
      />
    </SwitchField>
  )
}

export function PingOptions() {
  const pingOptions = useCampaignStore((state) => state.config.pingOptions)
  const updatePingOptions = useCampaignStore((state) => state.updatePingOptions)
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false)

  const addFieldRequirement = (requirement: Omit<PingFieldRequirement, 'id'>) => {
    updatePingOptions({
      fieldRequirements: [
        ...pingOptions.fieldRequirements,
        {
          id: `ping-field-${Date.now()}`,
          ...requirement,
        },
      ],
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <RequirementRow
          configKey="revenue"
          label="Revenue Requirement"
          helper="Resulting revenue must be at least:"
        />
        <Separator className="my-0" />
        <RequirementRow
          configKey="profit"
          label="Profit Requirement"
          helper="Revenue minus lead cost must be at least:"
        />
        <Separator className="my-0" />
        <RequirementRow
          configKey="profitPercentage"
          label="Profit Percentage Requirement"
          helper="Profit percentage must be at least:"
        />
        <Separator className="my-0" />
        <RequirementRow
          configKey="minimumDeliveryCount"
          label="Minimum Delivery Count"
          helper="Estimated delivery count must be at least:"
        />
        <Separator className="my-0" />

        <SwitchField
          label="Qualify All Criteria"
          description={(
            <>
              Qualify clients using all criteria.<br />
              Note: If no is selected, clients will be qualified only using the field values supplied on the PING request.
            </>
          )}
          checked={pingOptions.qualifyAllCriteria}
          onCheckedChange={(qualifyAllCriteria) => updatePingOptions({ qualifyAllCriteria })}
        />

        <Separator className="my-0" />

        <SectionHeading
          title="Field Requirements for PING"
          description="The following fields will be reported as either required or optional for the PING order"
        />

        <DataGrid
          className="h-[260px] min-h-[260px]"
          columns={fieldColumns}
          data={pingOptions.fieldRequirements}
          emptyMessage="No Fields"
          toolbar={
            <DataGridToolbar>
              <ToolbarAction icon={Plus} label="Add" onClick={() => setFieldDialogOpen(true)} />
              <ToolbarAction icon={X} label="Remove" disabled />
            </DataGridToolbar>
          }
        />
      </div>

      <PingRequiredFieldDialog
        open={fieldDialogOpen}
        onClose={() => setFieldDialogOpen(false)}
        onSave={addFieldRequirement}
      />
    </>
  )
}
