import { Input, SectionHeading, Separator, SwitchField } from '@/components/ui'

import type { ClientConfiguration, LimitSetting } from '../../types'

type RevenueSettings = ClientConfiguration['deliveryAccount']['revenue']
type RevenueKey = keyof RevenueSettings

interface RevenuePanelProps {
  value: RevenueSettings
  onChange: (partial: Partial<RevenueSettings>) => void
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const parseNumber = (value: string) => Number(value.replace(/[^0-9.-]/g, '')) || 0

export function RevenuePanel({ value, onChange }: RevenuePanelProps) {
  const update = (key: RevenueKey, partial: Partial<LimitSetting>) => {
    onChange({ [key]: { ...value[key], ...partial } })
  }

  const setting = (
    key: RevenueKey,
    label: string,
    description: string,
    format: 'currency' | 'percentage',
  ) => (
    <SwitchField
      label={label}
      description={description}
      checked={value[key].enabled}
      onCheckedChange={(enabled) => update(key, { enabled })}
    >
      <Input
        aria-label={`${label} Value`}
        inputMode="decimal"
        value={format === 'currency' ? currency(value[key].value) : `${value[key].value}%`}
        onChange={(event) => update(key, { value: parseNumber(event.target.value) })}
      />
    </SwitchField>
  )

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Delivery Requirements" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      {setting('revenueRequired', 'Revenue Required', 'Minimum revenue requirement', 'currency')}
      <Separator className="my-0" />
      {setting('profitRequired', 'Profit Required', 'Minimum profit requirement', 'currency')}
      <Separator className="my-0" />
      {setting('profitPercentageRequired', 'Profit % Required', 'Minimum profit percentage requirement', 'percentage')}
      <SectionHeading title="Lead Source Revenue Share" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      {setting(
        'revenueShareDollar',
        'Revenue Share Dollar',
        'This amount will be added on to the cost of the lead back to the source.',
        'currency',
      )}
      <Separator className="my-0" />
      {setting(
        'revenueSharePercentage',
        'Revenue Share Percentage',
        'The percentage of the sale specified will be added to the cost of the lead.',
        'percentage',
      )}
    </div>
  )
}
