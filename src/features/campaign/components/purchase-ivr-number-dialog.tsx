import { useMemo, useState } from 'react'

import { DataGrid } from '@/components/data-grid'
import type { DataGridColumn } from '@/components/data-grid/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PURCHASABLE_IVR_NUMBERS,
  type PurchasableIvrNumber,
} from '../data/ivr-numbers'

const columns: DataGridColumn<PurchasableIvrNumber>[] = [
  { key: 'number', header: 'Select Number', width: '68%' },
  {
    key: 'pricePerMonth',
    header: 'Price Per Month',
    width: '32%',
    render: (value) => <span className="block text-right">{value}</span>,
  },
]

interface PurchaseIvrNumberDialogProps {
  open: boolean
  onClose: () => void
  onPurchase: (number: string) => void
}

export function PurchaseIvrNumberDialog({
  open,
  onClose,
  onPurchase,
}: PurchaseIvrNumberDialogProps) {
  const [country, setCountry] = useState('us')
  const [numberType, setNumberType] = useState('toll-free')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedNumber = useMemo(() => {
    const selectedId = selectedIds.values().next().value
    return PURCHASABLE_IVR_NUMBERS.find((number) => number.id === selectedId) ?? null
  }, [selectedIds])

  const handleClose = () => {
    setSelectedIds(new Set())
    onClose()
  }

  const handlePurchase = () => {
    if (!selectedNumber) return
    onPurchase(selectedNumber.number)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[640px] flex-col gap-0 overflow-hidden p-0 shadow-panel"
        showClose={false}
      >
        <DialogPanelHeader title="Purchase IVR Number" onClose={handleClose} className="px-5 py-4" />
        <DialogDescription className="sr-only">
          Select an available phone number and purchase it for the displayed monthly price.
        </DialogDescription>

        <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5">
          <FieldGroup label="Country">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger aria-label="Country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Number Type">
            <Select value={numberType} onValueChange={setNumberType}>
              <SelectTrigger aria-label="Number Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toll-free">Toll Free</SelectItem>
                <SelectItem value="local">Local</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <section className="space-y-2">
            <h3 className="text-sm font-medium leading-5 text-foreground">Available Numbers</h3>
            <DataGrid
              columns={columns}
              data={PURCHASABLE_IVR_NUMBERS}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              className="h-[360px] border border-border [&_th]:text-sm [&_th:last-child]:text-right [&_td]:text-sm"
            />
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button disabled={!selectedNumber} onClick={handlePurchase}>Purchase</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
