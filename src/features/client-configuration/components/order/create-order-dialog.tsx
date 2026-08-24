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
  SavingOverlay,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SwitchField,
} from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'

import type { OrderCreationSubmission, OrderItem } from '../../types'

interface CreateOrderDialogProps {
  open: boolean
  deliveryAccountName: string
  defaultLeadPrice: number
  onClose: () => void
  onCreate: (submission: OrderCreationSubmission) => void
}

export function CreateOrderDialog({
  open,
  deliveryAccountName,
  defaultLeadPrice,
  onClose,
  onCreate,
}: CreateOrderDialogProps) {
  const [name, setName] = useState('')
  const [leadType, setLeadType] = useState('Short Mortgage Lead')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('2026-08-24')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<OrderCreationSubmission['status']>('on-hold')
  const [renewOrder, setRenewOrder] = useState(false)
  const [autoCharge, setAutoCharge] = useState(false)
  const [deliveryAccount, setDeliveryAccount] = useState('All Delivery Accounts')
  const [orderType, setOrderType] = useState<OrderItem['orderType']>('Lead Quantity')
  const [quantity, setQuantity] = useState('1')
  const [perLeadPrice, setPerLeadPrice] = useState(String(defaultLeadPrice.toFixed(2)))
  const [paymentDiscount, setPaymentDiscount] = useState('0')
  const [maxReturnPercentage, setMaxReturnPercentage] = useState('0')
  const [nameError, setNameError] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleCreate = async () => {
    const nextNameError = name.trim() ? '' : 'Order Name is required.'
    const numericQuantity = Number(quantity)
    const nextQuantityError = numericQuantity > 0 ? '' : 'Quantity must be greater than zero.'
    setNameError(nextNameError)
    setQuantityError(nextQuantityError)
    if (nextNameError || nextQuantityError) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    onCreate({
      name: name.trim(),
      leadType,
      description: description.trim(),
      status,
      startDate,
      endDate,
      renewOrder,
      autoCharge,
      paymentDiscount: Number(paymentDiscount) || 0,
      maxReturnPercentage: Number(maxReturnPercentage) || 0,
      deliveryAccount,
      orderType,
      quantity: numericQuantity,
      perLeadPrice: Number(perLeadPrice) || 0,
    })
    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showClose={false}
        className="max-h-[88vh] max-w-[880px] gap-0 overflow-hidden p-0 shadow-panel"
      >
        <DialogPanelHeader title="Create Order" onClose={onClose} />
        <DialogDescription className="sr-only">
          Create a safe outbound lead order and its first Delivery Account item.
        </DialogDescription>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FieldGroup label="Order Name" required className="md:col-span-2">
              <Input
                aria-label="Order Name"
                value={name}
                aria-invalid={Boolean(nameError)}
                placeholder="Example: Codex Demo Mortgage Order"
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError('')
                }}
              />
              {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
            </FieldGroup>

            <FieldGroup label="Lead Type">
              <Select value={leadType} onValueChange={setLeadType}>
                <SelectTrigger aria-label="Lead Type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short Mortgage Lead">Short Mortgage Lead</SelectItem>
                  <SelectItem value="Auto Insurance Lead">Auto Insurance Lead</SelectItem>
                  <SelectItem value="Home Services Lead">Home Services Lead</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Initial Status">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OrderCreationSubmission['status'])}
              >
                <SelectTrigger aria-label="Initial Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Description" className="md:col-span-2">
              <Textarea
                aria-label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the purpose of this order"
              />
            </FieldGroup>

            <FieldGroup label="Start Date">
              <Input
                aria-label="Start Date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="End Date" description="Optional">
              <Input
                aria-label="End Date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </FieldGroup>

            <div className="md:col-span-2"><Separator /></div>

            <SwitchField
              label="Renew Order"
              description="Automatically create a replacement when this order is completed."
              checked={renewOrder}
              onCheckedChange={setRenewOrder}
            />
            <SwitchField
              label="Auto Charge"
              description="Configuration preview only; no payment workflow is triggered."
              checked={autoCharge}
              onCheckedChange={setAutoCharge}
            />

            <div className="md:col-span-2"><Separator /></div>

            <FieldGroup label="Delivery Account">
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
            <FieldGroup label="Per Lead Price">
              <Input
                aria-label="Per Lead Price"
                type="number"
                min="0"
                step="0.01"
                value={perLeadPrice}
                onChange={(event) => setPerLeadPrice(event.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Payment Discount" description="Configuration only">
              <Input
                aria-label="Payment Discount"
                type="number"
                min="0"
                value={paymentDiscount}
                onChange={(event) => setPaymentDiscount(event.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Max Return Percentage">
              <Input
                aria-label="Max Return Percentage"
                type="number"
                min="0"
                max="100"
                value={maxReturnPercentage}
                onChange={(event) => setMaxReturnPercentage(event.target.value)}
              />
            </FieldGroup>
          </div>
          <SavingOverlay open={isSaving} message="Creating order..." />
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button variant="success" onClick={handleCreate} disabled={isSaving}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
