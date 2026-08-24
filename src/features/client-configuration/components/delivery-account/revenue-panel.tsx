import { Input, SectionHeading, Separator, SwitchField } from '@/components/ui'

import type { ClientConfiguration, LimitSetting } from '../../types'

type RevenueSettings = ClientConfiguration['deliveryAccount']['revenue']
type RevenueKey = keyof RevenueSettings

interface RevenuePanelProps {
  value: RevenueSettings
  onChange: (partial: Partial<RevenueSettings>) => void
}

export function RevenuePanel({ value, onChange }: RevenuePanelProps) {
  const update = (key: RevenueKey, partial: Partial<LimitSetting>) => {
    onChange({ [key]: { ...value[key], ...partial } })
  }

  const setting = (key: RevenueKey, label: string, description: string) => (
    <SwitchField
      label={label}
      description={description}
      checked={value[key].enabled}
      onCheckedChange={(enabled) => update(key, { enabled })}
    >
      <Input
        aria-label={`${label} Value`}
        type="number"
        min="0"
        step="0.01"
        value={value[key].value}
        onChange={(event) => update(key, { value: Number(event.target.value) || 0 })}
      />
    </SwitchField>
  )

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Delivery Requirements" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      {setting('revenueRequired', 'Revenue Required', 'Minimum revenue requirement.')}
      <Separator />
      {setting('profitRequired', 'Profit Required', 'Minimum profit requirement.')}
      <Separator />
      {setting('profitPercentageRequired', 'Profit % Required', 'Minimum profit percentage requirement.')}
      <SectionHeading title="Lead Source Revenue Share" size="sm" className="rounded-[4px] bg-muted px-3 py-2" />
      {setting('revenueShareDollar', 'Revenue Share Dollar', 'Add this amount to the source cost of each lead.')}
      <Separator />
      {setting('revenueSharePercentage', 'Revenue Share Percentage', 'Add this percentage to the source cost of each lead.')}
    </div>
  )
}
