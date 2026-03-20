import { CheckSquare } from 'lucide-react'
import { useCampaignStore } from '../store'
import {
  FieldGroup,
  SectionHeading,
  SwitchField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function LeadValidation() {
  const validation = useCampaignStore((s) => s.config.leadValidation)
  const update = useCampaignStore((s) => s.updateLeadValidation)

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Quality Control"
        icon={<CheckSquare className="size-5" />}
      />

      <SwitchField
        label="Use Quality Control"
        description="Specify if this Campaign should move new leads into quality control."
        checked={validation.useQualityControl}
        onCheckedChange={(v) => update({ useQualityControl: v })}
      />

      <FieldGroup label="Default Reject Action" description="Specify the action to take when a lead is rejected.">
        <Select value={validation.defaultRejectAction} onValueChange={(v) => update({ defaultRejectAction: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reject-to-source">Reject back to Lead Source</SelectItem>
            <SelectItem value="reject-archive">Archive</SelectItem>
            <SelectItem value="reject-delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator />

      <SwitchField
        label="Scan Coverage"
        description="Verify coverage or delivery of record before sending response"
        checked={validation.scanCoverage !== ''}
        onCheckedChange={(v) => update({ scanCoverage: v ? 'reject-no-coverage' : '' })}
      >
        <Select value={validation.scanCoverage} onValueChange={(v) => update({ scanCoverage: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reject-no-coverage">Reject for no coverage</SelectItem>
            <SelectItem value="accept-no-coverage">Accept with no coverage</SelectItem>
          </SelectContent>
        </Select>
      </SwitchField>

      <SwitchField
        label="Standardize Address"
        meta="$0.03 per lead"
        description="Apply industry standardization to the primary address."
        checked={validation.standardizeAddress}
        onCheckedChange={(v) => update({ standardizeAddress: v })}
      />

      <SwitchField
        label="Append City and State"
        meta="$0.03 per lead"
        description="Leads received with a postal code and country will attempt to append a city and state."
        checked={validation.appendCityState}
        onCheckedChange={(v) => update({ appendCityState: v })}
      />

      <SwitchField
        label="Mobile Check"
        meta="$0.03 per lead"
        description="Check if the lead's primary phone number is a mobile number."
        checked={validation.mobileCheck}
        onCheckedChange={(v) => update({ mobileCheck: v })}
      />

      <SwitchField
        label="Geolocate IP Address"
        description="Geolocation IP address of the lead. (fee may apply)"
        checked={validation.geolocateIp}
        onCheckedChange={(v) => update({ geolocateIp: v })}
      />

      <Separator />

      <SectionHeading
        title="Lead Grading"
        icon={<span className="text-sm font-bold">A</span>}
      />

      <SwitchField
        label="Enable Lead Grading"
        description="Enable grading services for inbound leads"
        checked={validation.enableLeadGrading}
        onCheckedChange={(v) => update({ enableLeadGrading: v })}
      />

      {validation.enableLeadGrading && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Configuration</p>
          <p className="text-xs text-muted-foreground">
            Current Setting: Using default settings from parent lead source
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant={validation.gradingConfigMode === 'lead-source' ? 'default' : 'outline'}
              size="sm"
              onClick={() => update({ gradingConfigMode: 'lead-source' })}
            >
              Use Lead Source Settings
            </Button>
            <Button
              variant={validation.gradingConfigMode === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => update({ gradingConfigMode: 'custom' })}
            >
              Customize Settings for this Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
