import { useCampaignStore } from '../store'
import {
  FieldGroup,
  SectionHeading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { PricingModelSelector } from './pricing-model-selector'
import { CAMPAIGN_STATUS_OPTIONS, type CampaignStatus } from '../types'
import { cn } from '@/lib/utils'

interface GeneralSettingsProps {
  campaignNameError?: string
  onCampaignNameBlur?: (value: string) => void
  onCampaignNameChange?: () => void
}

export function GeneralSettings({
  campaignNameError,
  onCampaignNameBlur,
  onCampaignNameChange,
}: GeneralSettingsProps = {}) {
  const general = useCampaignStore((s) => s.config.general)
  const update = useCampaignStore((s) => s.updateGeneral)
  // Selecting a Revenue Share model also locks Sale & Coverage Verification over in
  // Lead Validation, so the pricing change goes through the store rather than a plain
  // field merge.
  const setPricingModel = useCampaignStore((s) => s.setPricingModel)

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Campaign Name" required>
        <DebouncedInput
          value={general.name}
          onValueCommit={(v: string) => update({ name: v })}
          onChange={(event) => {
            update({ name: event.target.value })
            onCampaignNameChange?.()
          }}
          onBlur={(event) => onCampaignNameBlur?.(event.target.value)}
          placeholder="Enter campaign name"
          aria-invalid={Boolean(campaignNameError)}
          className={cn(campaignNameError && 'border-destructive')}
        />
        {campaignNameError && (
          <p className="mt-1 text-xs text-destructive">{campaignNameError}</p>
        )}
      </FieldGroup>

      <FieldGroup label="Status" description="Select the current status of this campaign">
        <Select
          value={general.status}
          onValueChange={(v: string) => update({ status: v as CampaignStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs leading-4 text-muted-foreground mt-2">
          <span className="font-semibold">Note:</span> Only active campaigns can accept leads.
        </p>
      </FieldGroup>

      <Separator className="my-0" />

      <SectionHeading title="Payout Options" />

      <PricingModelSelector
        value={general.pricingModel}
        onChange={setPricingModel}
        pricePerLead={general.pricePerLead}
        onPricePerLeadChange={(v) => update({ pricePerLead: v })}
        pricePerSale={general.pricePerSale}
        onPricePerSaleChange={(v) => update({ pricePerSale: v })}
        revenueSharePct={general.revenueSharePct}
        onRevenueSharePctChange={(v) => update({ revenueSharePct: v })}
        idPrefix="gs-"
      />
    </div>
  )
}
