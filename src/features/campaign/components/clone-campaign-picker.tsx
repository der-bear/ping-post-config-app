import { ArrowDown } from 'lucide-react'
import { FieldGroup, SectionHeading, SelectBox } from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { cn } from '@/lib/utils'
import { CAMPAIGN_STATUS_OPTIONS, type CampaignStatus } from '../types'
import { LEAD_SOURCE_OPTIONS, CLONE_SOURCE_CAMPAIGNS } from '../data/mock-campaigns'

interface CloneCampaignPickerProps {
  /** Campaign-only mode shows the target lead source; lead-source mode hides it because
   *  the lead source being created is the target. */
  showTarget: boolean
  targetLeadSource: string
  onTargetLeadSourceChange: (value: string) => void
  campaignId: string
  onCampaignIdChange: (value: string) => void
  campaignName: string
  onCampaignNameChange: (value: string) => void
  status: CampaignStatus
  onStatusChange: (value: CampaignStatus) => void
  errors: { target?: string; campaign?: string; name?: string }
}

/** Copy a campaign: pick the source campaign, then define the new campaign. Groups use a
 *  sub-header with assistive text beneath it; fields carry labels only (no descriptions). */
export function CloneCampaignPicker({
  showTarget,
  targetLeadSource,
  onTargetLeadSourceChange,
  campaignId,
  onCampaignIdChange,
  campaignName,
  onCampaignNameChange,
  status,
  onStatusChange,
  errors,
}: CloneCampaignPickerProps) {
  const options = CLONE_SOURCE_CAMPAIGNS.map((c) => ({ value: c.id, label: `${c.id} - ${c.name}` }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 rounded-[4px] border border-border bg-background p-5">
        <SectionHeading
          title="Source Campaign"
          description="The existing campaign to copy settings from."
        />
        <SelectBox
          searchable
          options={options}
          value={campaignId}
          onValueChange={onCampaignIdChange}
          placeholder="Search by campaign name or ID"
          emptyMessage="No campaigns found"
          className={cn(errors.campaign && 'border-destructive')}
        />
        {errors.campaign && <p className="text-xs text-destructive">{errors.campaign}</p>}
      </div>

      {/* Copy direction: source above → new campaign below. */}
      <div className="flex justify-center py-0.5 text-muted-foreground/50">
        <ArrowDown className="size-5" />
      </div>

      <div className="flex flex-col gap-4 rounded-[4px] border border-border bg-background p-5">
        <SectionHeading
          title="New Campaign"
          description="Details for the new campaign."
        />

        <FieldGroup label="Campaign Name" required>
          <DebouncedInput
            value={campaignName}
            onValueCommit={onCampaignNameChange}
            onChange={(event) => onCampaignNameChange(event.target.value)}
            placeholder="Example: Contact Us Form"
            className={cn(errors.name && 'border-destructive')}
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </FieldGroup>

        <FieldGroup label="Status" description="Select the current status of this campaign">
          <SelectBox
            options={CAMPAIGN_STATUS_OPTIONS}
            value={status}
            onValueChange={(value) => onStatusChange(value as CampaignStatus)}
          />
        </FieldGroup>

        {showTarget && (
          <FieldGroup label="Target Lead Source" description="The source of leads for this campaign." required>
            <SelectBox
              options={LEAD_SOURCE_OPTIONS}
              value={targetLeadSource}
              onValueChange={onTargetLeadSourceChange}
              placeholder="Select lead source"
              className={cn(errors.target && 'border-destructive')}
            />
            {errors.target && <p className="mt-1 text-xs text-destructive">{errors.target}</p>}
          </FieldGroup>
        )}
      </div>
    </div>
  )
}
