import { FieldGroup, SectionHeading, SelectBox } from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SectionHeading
          title="Copy From"
          description="Select the existing campaign to copy settings from."
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

      <Separator className="my-0" />

      <div className="flex flex-col gap-4">
        <SectionHeading
          title="Copy To"
          description="Enter a name for the new campaign and choose where it should be created."
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

        {showTarget && (
          <FieldGroup label="Lead Source" description="Select the lead source where this campaign will be created." required>
            <SelectBox
              searchable
              options={LEAD_SOURCE_OPTIONS}
              value={targetLeadSource}
              onValueChange={onTargetLeadSourceChange}
              placeholder="Select lead source"
              emptyMessage="No lead sources found"
              className={cn(errors.target && 'border-destructive')}
            />
            {errors.target && <p className="mt-1 text-xs text-destructive">{errors.target}</p>}
          </FieldGroup>
        )}

        <FieldGroup label="Status" description="Select the initial status for the new campaign.">
          <SelectBox
            options={CAMPAIGN_STATUS_OPTIONS}
            value={status}
            onValueChange={(value) => onStatusChange(value as CampaignStatus)}
          />
        </FieldGroup>
      </div>
    </div>
  )
}
