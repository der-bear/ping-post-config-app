import { Shield, List } from 'lucide-react'
import { useCampaignStore } from '../store'
import {
  FieldGroup,
  SectionHeading,
  SwitchField,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Separator } from '@/components/ui/separator'

export function ComplianceSettings() {
  const compliance = useCampaignStore((s) => s.config.compliance)
  const update = useCampaignStore((s) => s.updateCompliance)

  return (
    <div className="space-y-5">
      <SectionHeading
        title="TCPA"
        icon={<Shield className="size-5" />}
      />

      <SwitchField
        label="Enable TCPA Services"
        description="Enable the ability to provide TCPA consent text to 3rd party for internal forms."
        checked={compliance.enableTcpa}
        onCheckedChange={(v) => update({ enableTcpa: v })}
      />

      <Separator />

      <SectionHeading
        title="FCC 1 to 1 Consent"
        icon={<List className="size-5" />}
      />

      <SwitchField
        label="Return Client Offers"
        description="Return the offer information located on the associated delivery account of the selected client. This information can be used to force a 1 to 1 delivery by allowing the source to present offers to the end consumer."
        checked={compliance.returnClientOffers}
        onCheckedChange={(v) => update({ returnClientOffers: v })}
      />

      <Separator />

      <SectionHeading
        title="GDPR"
        icon={<Shield className="size-5" />}
      />

      <SwitchField
        label="Retention Policy"
        description="The amount of days before any lead received is automatically removed from the system."
        checked={compliance.retentionPolicyDays !== '0'}
        onCheckedChange={(v) => update({ retentionPolicyDays: v ? '90' : '0' })}
      >
        <FieldGroup>
          <DebouncedInput
            value={compliance.retentionPolicyDays}
            onValueCommit={(v: string) => update({ retentionPolicyDays: v })}
            placeholder="0 Days"
          />
        </FieldGroup>
      </SwitchField>

      <SwitchField
        label="Rejected Retention Policy"
        description="The amount of days before only rejected leads are automatically removed from the system. Note: This will override any retention policy set above for rejected leads."
        checked={compliance.rejectedRetentionDays !== '0'}
        onCheckedChange={(v) => update({ rejectedRetentionDays: v ? '30' : '0' })}
      >
        <FieldGroup>
          <DebouncedInput
            value={compliance.rejectedRetentionDays}
            onValueCommit={(v: string) => update({ rejectedRetentionDays: v })}
            placeholder="0 Days"
          />
        </FieldGroup>
      </SwitchField>
    </div>
  )
}
