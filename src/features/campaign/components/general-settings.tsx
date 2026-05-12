import { useCampaignStore } from '../store'
import {
  FieldGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { PricingModelSelector } from './pricing-model-selector'
import type { CampaignStatus, PricingModel } from '../types'

export function GeneralSettings() {
  const general = useCampaignStore((s) => s.config.general)
  const update = useCampaignStore((s) => s.updateGeneral)

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Campaign Name">
        <DebouncedInput
          value={general.name}
          onValueCommit={(v: string) => update({ name: v })}
          placeholder="Enter campaign name"
        />
      </FieldGroup>

      <Separator className="my-0" />

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

      <Separator className="my-0" />

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
          <span className="font-semibold">Note:</span> Only active campaigns can successfully send in leads, all other statuses will be rejected.
        </p>
      </FieldGroup>
    </div>
  )
}
