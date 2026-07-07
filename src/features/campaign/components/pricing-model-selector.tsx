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
    <RadioGroup
      value={value}
      onValueChange={(v: string) => onChange(v as PricingModel)}
      className="flex flex-col gap-4"
    >
      <label htmlFor={id('per-lead')} className="flex items-start gap-3 cursor-pointer">
        <RadioGroupItem value="per-lead" id={id('per-lead')} className="" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-normal leading-5 text-foreground">Price Per Lead</p>
            <p className="text-xs leading-4 text-muted-foreground">Set the default price for each inbound lead.</p>
          </div>
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
      <label htmlFor={id('revenue-share')} className="flex items-start gap-3 cursor-pointer">
        <RadioGroupItem value="revenue-share" id={id('revenue-share')} className="" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-normal leading-5 text-foreground">Revenue Share - Percentage</p>
            <p className="text-xs leading-4 text-muted-foreground">Specify the percentage of each sale amount to be paid.</p>
          </div>
          {value === 'revenue-share' && onRevenueSharePctChange && (
            <Input
              value={revenueSharePct}
              onChange={(e) => onRevenueSharePctChange(e.target.value)}
              onClick={(e) => e.preventDefault()}
            />
          )}
        </div>
      </label>
      <label htmlFor={id('per-sale')} className="flex items-start gap-3 cursor-pointer">
        <RadioGroupItem value="per-sale" id={id('per-sale')} className="" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-normal leading-5 text-foreground">Revenue Share - Price Per Sale</p>
            <p className="text-xs leading-4 text-muted-foreground">Specify the fixed dollar amount to be paid for each sale.</p>
          </div>
          {value === 'per-sale' && onPricePerSaleChange && (
            <Input
              value={pricePerSale}
              onChange={(e) => onPricePerSaleChange(e.target.value)}
              onClick={(e) => e.preventDefault()}
            />
          )}
        </div>
      </label>
    </RadioGroup>
  )
}
