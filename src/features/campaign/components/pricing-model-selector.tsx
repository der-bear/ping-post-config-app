import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import type { PricingModel } from '../types'

interface PricingModelSelectorProps {
  value: PricingModel
  onChange: (value: PricingModel) => void
  pricePerLead: string
  onPricePerLeadChange: (value: string) => void
  pricePerSale?: string
  onPricePerSaleChange?: (value: string) => void
  revenueSharePct?: string
  onRevenueSharePctChange?: (value: string) => void
  idPrefix?: string
}

export function PricingModelSelector({
  value,
  onChange,
  pricePerLead,
  onPricePerLeadChange,
  pricePerSale,
  onPricePerSaleChange,
  revenueSharePct,
  onRevenueSharePctChange,
  idPrefix = '',
}: PricingModelSelectorProps) {
  const id = (suffix: string) => `${idPrefix}${suffix}`

  return (
    <div className="space-y-3">
      <RadioGroup value={value} onValueChange={(v: string) => onChange(v as PricingModel)}>
        <label htmlFor={id('per-lead')} className="flex items-start gap-3 cursor-pointer">
          <RadioGroupItem value="per-lead" id={id('per-lead')} className="mt-1" />
          <div className="space-y-1.5 flex-1">
            <p className="text-sm font-medium">Price Per Lead</p>
            <p className="text-xs text-muted-foreground">Set the default price for each inbound lead.</p>
            {value === 'per-lead' && (
              <Input
                value={pricePerLead}
                onChange={(e) => onPricePerLeadChange(e.target.value)}
                className="max-w-full"
                onClick={(e) => e.preventDefault()}
              />
            )}
          </div>
        </label>
        <label htmlFor={id('per-sale')} className="flex items-start gap-3 cursor-pointer">
          <RadioGroupItem value="per-sale" id={id('per-sale')} className="mt-1" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">Price Per Sale</p>
            <p className="text-xs text-muted-foreground">Specify the dollar amount for each sale that should be applied.</p>
            {value === 'per-sale' && onPricePerSaleChange && (
              <Input
                value={pricePerSale}
                onChange={(e) => onPricePerSaleChange(e.target.value)}
                onClick={(e) => e.preventDefault()}
              />
            )}
          </div>
        </label>
        <label htmlFor={id('revenue-share')} className="flex items-start gap-3 cursor-pointer">
          <RadioGroupItem value="revenue-share" id={id('revenue-share')} className="mt-1" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">Revenue Share, %</p>
            <p className="text-xs text-muted-foreground">Specify the percentage of the sale amount that should be applied as revenue share.</p>
            {value === 'revenue-share' && onRevenueSharePctChange && (
              <Input
                value={revenueSharePct}
                onChange={(e) => onRevenueSharePctChange(e.target.value)}
                onClick={(e) => e.preventDefault()}
              />
            )}
          </div>
        </label>
      </RadioGroup>
    </div>
  )
}
