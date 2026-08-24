import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
  FieldGroup,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

import type { OrderItem } from '../../types'

interface OrderItemDialogProps {
  open: boolean
  deliveryAccountName: string
  initialValue?: OrderItem
  onClose: () => void
  onSave: (item: Omit<OrderItem, 'id' | 'sent'>) => void
}

export function OrderItemDialog({
  open,
  deliveryAccountName,
  initialValue,
  onClose,
  onSave,
}: OrderItemDialogProps) {
  const [deliveryAccount, setDeliveryAccount] = useState(
    initialValue?.deliveryAccount ?? 'All Delivery Accounts',
  )
  const [orderType, setOrderType] = useState<OrderItem['orderType']>(
    initialValue?.orderType ?? 'Lead Quantity',
  )
  const [quantity, setQuantity] = useState(String(initialValue?.quantity ?? 1))
  const [perLeadPrice, setPerLeadPrice] = useState(String(initialValue?.perLeadPrice ?? 0))
  const [quantityError, setQuantityError] = useState('')

  const handleSave = () => {
    const numericQuantity = Number(quantity)
    if (numericQuantity <= 0) {
      setQuantityError('Quantity must be greater than zero.')
      return
    }
    onSave({
      deliveryAccount,
      orderType,
      quantity: numericQuantity,
      perLeadPrice: Number(perLeadPrice) || 0,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showClose={false} className="max-w-[620px] gap-0 overflow-hidden p-0 shadow-panel">
        <DialogPanelHeader title={initialValue ? 'Edit Order Item' : 'New Order Item'} onClose={onClose} />
        <DialogDescription className="sr-only">
          Choose a Delivery Account, order type, quantity, and price for this item.
        </DialogDescription>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <FieldGroup label="Delivery Account" className="sm:col-span-2">
            <Select value={deliveryAccount} onValueChange={setDeliveryAccount}>
              <SelectTrigger aria-label="Delivery Account"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Delivery Accounts">All Delivery Accounts</SelectItem>
                <SelectItem value={deliveryAccountName}>{deliveryAccountName}</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Order Type">
            <Select
              value={orderType}
              onValueChange={(value) => setOrderType(value as OrderItem['orderType'])}
            >
              <SelectTrigger aria-label="Order Type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Quantity">Lead Quantity</SelectItem>
                <SelectItem value="Reserved Dollar Bank">Reserved Dollar Bank</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Quantity" required>
            <Input
              aria-label="Quantity"
              type="number"
              min="1"
              value={quantity}
              aria-invalid={Boolean(quantityError)}
              onChange={(event) => {
                setQuantity(event.target.value)
                setQuantityError('')
              }}
            />
            {quantityError && <p className="mt-1 text-xs text-destructive">{quantityError}</p>}
          </FieldGroup>
          <FieldGroup label="Per Lead Price" className="sm:col-span-2">
            <Input
              aria-label="Per Lead Price"
              type="number"
              min="0"
              step="0.01"
              value={perLeadPrice}
              onChange={(event) => setPerLeadPrice(event.target.value)}
            />
          </FieldGroup>
        </div>
        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
