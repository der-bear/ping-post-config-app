import { useCampaignStore } from '../store'
import {
  FieldGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SwitchField,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Separator } from '@/components/ui/separator'

export function DuplicateChecks() {
  const checks = useCampaignStore((s) => s.config.duplicateChecks)
  const update = useCampaignStore((s) => s.updateDuplicateChecks)

  return (
    <div className="space-y-5">
      <FieldGroup label="Lead Type">
        <Select value={checks.leadType} disabled>
          <SelectTrigger disabled>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mortgage">Mortgage</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator />

      <SwitchField
        label="Check Rejected Leads"
        description="Should this campaign apply duplicate checking to previously rejected leads."
        checked={checks.checkRejectedLeads}
        onCheckedChange={(v) => update({ checkRejectedLeads: v })}
      />

      <FieldGroup label="Duplicate Day Setting" description="Specify how many days back the duplicate check should apply.">
        <DebouncedInput
          value={checks.duplicateDays}
          onValueCommit={(v: string) => update({ duplicateDays: v })}
          placeholder="30 Days"
        />
      </FieldGroup>

      <Separator />

      <SwitchField
        label="Append Duplicate Data"
        description="When receiving a duplicate lead, update existing lead with updated lead data."
        checked={checks.appendDuplicateData}
        onCheckedChange={(v) => update({ appendDuplicateData: v })}
      />

      <SwitchField
        label="Allow PING Duplicate API Check"
        description={
          <>
            Allow this campaign to utilize the duplicate check API to ensure non-duplicate before final lead submission.
            {' '}
            <span className="italic">
              Note: A fee may apply when using this feature, please refer to your{' '}
              <a href="#" className="text-primary hover:underline">subscription</a> page for more information.
            </span>
          </>
        }
        checked={checks.allowPingDuplicateCheck}
        onCheckedChange={(v) => update({ allowPingDuplicateCheck: v })}
      />

      <SwitchField
        label="Resend Deliveries"
        description="When receiving a duplicate lead, resend existing lead's deliveries."
        checked={checks.resendDeliveries}
        onCheckedChange={(v) => update({ resendDeliveries: v })}
      />
    </div>
  )
}
