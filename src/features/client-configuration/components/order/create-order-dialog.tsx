import { useState } from 'react'

import {
  Button,
  DateInput,
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
  onClose,
  onCreate,
}: CreateOrderDialogProps) {
  const [name, setName] = useState('')
  const [leadType, setLeadType] = useState('Any Lead Type')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<OrderCreationSubmission['status']>('open')
  const [renewOrder, setRenewOrder] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [deliveryAccount, setDeliveryAccount] = useState('')
  const [orderType, setOrderType] = useState<OrderItem['orderType']>('Lead Quantity')
  const [quantity, setQuantity] = useState('0')
  const [perLeadPrice, setPerLeadPrice] = useState('')
  const [paymentDiscount, setPaymentDiscount] = useState('$0.00')
  const [nameError, setNameError] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleCreate = async () => {
    const nextNameError = name.trim() ? '' : 'Name is required.'
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
      endDate: hasEndDate ? endDate : '',
      renewOrder,
      autoCharge: false,
      paymentDiscount: Number(paymentDiscount.replace(/[^0-9.-]/g, '')) || 0,
      maxReturnPercentage: 0,
      deliveryAccount: deliveryAccount || 'All Delivery Accounts',
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
        className="flex max-h-[calc(100vh-32px)] max-w-[560px] flex-col gap-0 overflow-hidden p-0 shadow-panel"
      >
        <DialogPanelHeader title="Create Order" onClose={onClose} />
        <DialogDescription className="sr-only">
          Create a safe outbound lead order and its first Delivery Account item.
        </DialogDescription>

        <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <FieldGroup label="Name" className="sm:col-span-2">
              <Input
                aria-label="Name"
                value={name}
                aria-invalid={Boolean(nameError)}
                placeholder="Required"
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError('')
                }}
              />
              {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
            </FieldGroup>

            <FieldGroup
              label="Lead Type"
              description="Select the vertical this order is for"
              className="sm:col-span-2"
            >
              <Select value={leadType} onValueChange={setLeadType}>
                <SelectTrigger aria-label="Lead Type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Lead Type">Any Lead Type</SelectItem>
                  <SelectItem value="Short Mortgage Lead">Short Mortgage Lead</SelectItem>
                  <SelectItem value="Auto Insurance Lead">Auto Insurance Lead</SelectItem>
                  <SelectItem value="Home Services Lead">Home Services Lead</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup
              label="Description"
              description="Brief description of what this order is for."
              className="sm:col-span-2"
            >
              <Input
                aria-label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FieldGroup>

            <FieldGroup label="Start Date" description="What date should this order begin?">
              <DateInput
                aria-label="Start Date"
                value={startDate}
                pickerLabel="Choose Start Date"
                onValueChange={setStartDate}
              />
            </FieldGroup>
            <SwitchField
              label="End Date"
              description="Should this order end on a specific date?"
              checked={hasEndDate}
              onCheckedChange={setHasEndDate}
            >
              <DateInput
                aria-label="End Date"
                value={endDate}
                pickerLabel="Choose End Date"
                onValueChange={setEndDate}
              />
            </SwitchField>

            <FieldGroup label="Initial Status">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OrderCreationSubmission['status'])}
              >
                <SelectTrigger aria-label="Initial Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <SwitchField
              label="Renew Order"
              description="Automatically renew this order when complete."
              checked={renewOrder}
              onCheckedChange={setRenewOrder}
            />

            <div className="sm:col-span-2"><Separator className="my-0" /></div>

            <FieldGroup label="Delivery Account" className="sm:col-span-2">
              <Select value={deliveryAccount} onValueChange={setDeliveryAccount}>
                <SelectTrigger aria-label="Delivery Account">
                  <SelectValue placeholder="Select delivery accounts or leave empty for all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Delivery Accounts">All Delivery Accounts</SelectItem>
                  {deliveryAccountName.trim() && (
                    <SelectItem value={deliveryAccountName}>{deliveryAccountName}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Order Type" className="sm:col-span-2">
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
            <FieldGroup label="Quantity" description="The quantity of leads being ordered.">
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
            <FieldGroup label="Per Lead Price" description="Set a per lead price including discounts.">
              <Input
                aria-label="Per Lead Price"
                inputMode="decimal"
                value={perLeadPrice}
                placeholder="Use Price on Delivery Account"
                onChange={(event) => setPerLeadPrice(event.target.value)}
              />
            </FieldGroup>
            <div className="sm:col-span-2"><Separator className="my-0" /></div>

            <FieldGroup
              label="Payment Discount"
              description="This amount will be deducted from the total amount due when a payment is processed."
              className="sm:col-span-2"
            >
              <Input
                aria-label="Payment Discount"
                inputMode="decimal"
                value={paymentDiscount}
                onChange={(event) => setPaymentDiscount(event.target.value)}
              />
            </FieldGroup>
          </div>
          <SavingOverlay open={isSaving} message="Creating order..." />
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Close</Button>
          <Button variant="success" onClick={handleCreate} disabled={isSaving}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
