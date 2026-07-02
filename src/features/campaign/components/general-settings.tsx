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
  SwitchField,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { PricingModelSelector } from './pricing-model-selector'
import type { CampaignStatus, PricingModel } from '../types'

export function GeneralSettings() {
  const general = useCampaignStore((s) => s.config.general)
  const update = useCampaignStore((s) => s.updateGeneral)
  const scanCoverage = useCampaignStore((s) => s.config.leadValidation.scanCoverage)
  const updateLeadValidation = useCampaignStore((s) => s.updateLeadValidation)

  // For Price Per Sale / Revenue Share, coverage must be confirmed before a
  // sale can be credited, so "Reject if no coverage" is forced on and locked.
  const coverageLocked =
    general.pricingModel === 'per-sale' || general.pricingModel === 'revenue-share'

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Campaign Name">
        <DebouncedInput
          value={general.name}
          onValueCommit={(v: string) => update({ name: v })}
          placeholder="Enter campaign name"
        />
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
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
        onChange={(v: PricingModel) => {
          update({ pricingModel: v })
          if (v !== 'per-lead') updateLeadValidation({ scanCoverage: 'reject-no-coverage' })
        }}
        pricePerLead={general.pricePerLead}
        onPricePerLeadChange={(v) => update({ pricePerLead: v })}
        pricePerSale={general.pricePerSale}
        onPricePerSaleChange={(v) => update({ pricePerSale: v })}
        revenueSharePct={general.revenueSharePct}
        onRevenueSharePctChange={(v) => update({ revenueSharePct: v })}
        idPrefix="gs-"
      />

      <Separator className="my-0" />

      <SwitchField
        label="Reject if no coverage"
        description="Payout only will apply only to sold leads."
        tooltip={
          coverageLocked
            ? 'Required for Price Per Sale and Revenue Share. Payout only applies when a lead sells.'
            : undefined
        }
        checked={coverageLocked || scanCoverage === 'reject-no-coverage'}
        disabled={coverageLocked}
        onCheckedChange={(v) =>
          updateLeadValidation({ scanCoverage: v ? 'reject-no-coverage' : 'accept-no-coverage' })
        }
      />
    </div>
  )
}
