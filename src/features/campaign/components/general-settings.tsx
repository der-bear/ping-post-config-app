import { useCampaignStore } from '../store'
import {
  FieldGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { PricingModelSelector } from './pricing-model-selector'
import type { CampaignStatus, PricingModel } from '../types'

export function GeneralSettings() {
  const general = useCampaignStore((s) => s.config.general)
  const update = useCampaignStore((s) => s.updateGeneral)

  return (
    <div className="space-y-5">
      <FieldGroup label="Campaign Name">
        <DebouncedInput
          value={general.name}
          onValueCommit={(v: string) => update({ name: v })}
          placeholder="Enter campaign name"
        />
      </FieldGroup>

      <PricingModelSelector
        value={general.pricingModel}
        onChange={(v: PricingModel) => update({ pricingModel: v })}
        pricePerLead={general.pricePerLead}
        onPricePerLeadChange={(v) => update({ pricePerLead: v })}
        pricePerSale={general.pricePerSale}
        onPricePerSaleChange={(v) => update({ pricePerSale: v })}
        revenueSharePct={general.revenueSharePct}
        onRevenueSharePctChange={(v) => update({ revenueSharePct: v })}
        idPrefix="gs-"
      />

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
        <p className="text-xs text-muted-foreground italic mt-1">
          <strong>Note:</strong> Only active campaigns can successfully send in leads, all other statuses will be rejected.
        </p>
      </FieldGroup>
    </div>
  )
}
