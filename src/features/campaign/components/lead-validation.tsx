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
import {
  DEFAULT_REJECT_ACTION_OPTIONS,
  SCAN_COVERAGE_OPTIONS,
  type DefaultRejectAction,
  type ScanCoverageOption,
} from '../types'

export function LeadValidation() {
  const validation = useCampaignStore((s) => s.config.leadValidation)
  const update = useCampaignStore((s) => s.updateLeadValidation)
  const pricingModel = useCampaignStore((s) => s.config.general.pricingModel)

  // Revenue Share models only pay out on a sale, so verification is forced on and the
  // toggle is locked. The policy dropdown stays editable.
  const verificationLocked = pricingModel === 'per-sale' || pricingModel === 'revenue-share'

  return (
    <div className="flex flex-col gap-4">
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

      <Separator className="my-0" />

      <FieldGroup label="Default Reject Action" description="Specify the action to take when a lead is rejected.">
        <Select
          value={validation.defaultRejectAction}
          onValueChange={(v) => update({ defaultRejectAction: v as DefaultRejectAction })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_REJECT_ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      <Separator className="my-0" />

      <SwitchField
        label="Sale & Coverage Verification"
        description="Verify coverage or sale of record before sending response to lead source."
        lockedTooltip="Automatically enabled and required for Revenue Share payout models, which can only calculate the payout once delivery is complete."
        checked={verificationLocked || validation.scanCoverageEnabled}
        disabled={verificationLocked}
        onCheckedChange={(v) => update({ scanCoverageEnabled: v })}
      >
        <Select
          value={validation.scanCoverage}
          onValueChange={(v) => update({ scanCoverage: v as ScanCoverageOption })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCAN_COVERAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SwitchField>

      <Separator className="my-0" />

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
        meta="$0.02 per lead"
        description="Geolocation IP address of the lead. (fee may apply)"
        checked={validation.geolocateIp}
        onCheckedChange={(v) => update({ geolocateIp: v })}
      />

      <Separator className="my-0" />

      <SectionHeading
        title="Lead Grading"
        icon={
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-current text-xs font-bold leading-none">
            A
          </span>
        }
      />

      <SwitchField
        label="Enable Lead Grading"
        description="Enable grading services for inbound leads"
        checked={validation.enableLeadGrading}
        onCheckedChange={(v) => update({ enableLeadGrading: v })}
      />

      <Separator className="my-0" />

      <div className="space-y-2">
        <p className="text-sm font-semibold leading-5">Configuration</p>
        <p className="text-xs text-muted-foreground">
          Current Setting: Using default settings from parent lead source
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => update({ gradingConfigMode: 'lead-source' })}
          >
            Use Lead Source Settings
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => update({ gradingConfigMode: 'custom' })}
          >
            Customize Settings for this Campaign
          </Button>
        </div>
      </div>
    </div>
  )
}
