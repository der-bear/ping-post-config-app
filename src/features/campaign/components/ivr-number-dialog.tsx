import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field-group'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PURCHASABLE_IVR_NUMBERS } from '../data/ivr-numbers'
import { PurchaseIvrNumberDialog } from './purchase-ivr-number-dialog'

interface IvrNumberDialogProps {
  open: boolean
  onClose: () => void
}

export function IvrNumberDialog({ open, onClose }: IvrNumberDialogProps) {
  const [name, setName] = useState('')
  const [ivrNumber, setIvrNumber] = useState('unavailable')
  const [callFlow, setCallFlow] = useState('')
  const [messageFlow, setMessageFlow] = useState('')
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent
          className="max-w-[640px] gap-0 overflow-hidden p-0 shadow-panel"
          showClose={false}
        >
          <DialogPanelHeader title="IVR Number Details" onClose={onClose} className="px-5 py-4" />
          <DialogDescription className="sr-only">
            Choose an IVR number and connect call and message flows.
          </DialogDescription>

          <div className="space-y-5 px-5 py-5">
            <FieldGroup label="Name">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </FieldGroup>

            <FieldGroup label="IVR Number">
              <Select value={ivrNumber} onValueChange={setIvrNumber}>
                <SelectTrigger aria-label="IVR Number">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">No Numbers Available</SelectItem>
                  <SelectItem value="(877) 624-3580">(877) 624-3580</SelectItem>
                  {PURCHASABLE_IVR_NUMBERS.map((number) => (
                    <SelectItem key={number.id} value={number.number}>{number.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <Separator />

            <FieldGroup label="Call Flow">
              <Select value={callFlow} onValueChange={setCallFlow}>
                <SelectTrigger aria-label="Call Flow">
                  <SelectValue placeholder="-- Select Call Flow --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-call-flow">Main Call Flow</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Message Flow">
              <Select value={messageFlow} onValueChange={setMessageFlow}>
                <SelectTrigger aria-label="Message Flow">
                  <SelectValue placeholder="-- Select Message Flow --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-message-flow">Main Message Flow</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>

            <p className="text-xs leading-5 text-muted-foreground">
              Company verification is required for SMS messaging.<br />
              For more information visit{' '}
              <a href="#messaging-requirements" className="text-primary hover:underline">
                Messaging Requirements
              </a>
              .
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <Button className="bg-indigo-700 hover:bg-indigo-700/90" onClick={() => setPurchaseOpen(true)}>
              Purchase New Number
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={onClose}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PurchaseIvrNumberDialog
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onPurchase={setIvrNumber}
      />
    </>
  )
}
