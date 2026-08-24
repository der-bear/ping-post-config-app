import { CircleCheck, CircleHelp, ClipboardList, ListFilter, Settings2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui'

interface ClientNextStepsDialogProps {
  deliveryAccountName: string
  onCreateOrder: () => void
  onOpenCriteria: () => void
  onEditDeliveryAccount: () => void
  onClose: () => void
}

const actionClassName =
  'flex w-full items-start gap-4 rounded-md border border-border bg-background p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function ClientNextStepsDialog({
  deliveryAccountName,
  onCreateOrder,
  onOpenCriteria,
  onEditDeliveryAccount,
  onClose,
}: ClientNextStepsDialogProps) {
  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showClose={false}
        className="max-h-[92vh] max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-[960px]"
      >
        <DialogPanelHeader title="Next Steps" onClose={onClose} />
        <DialogDescription className="sr-only">
          Client creation completed. Choose the next outbound configuration action.
        </DialogDescription>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[0.9fr_1.35fr]">
          <section className="flex min-h-[420px] flex-col px-7 py-7 md:px-8">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <CircleCheck className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 text-foreground">
              Your client has been created!
            </h2>
            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              Initial configuration for the{' '}
              <strong className="font-semibold text-foreground">
                &quot;{deliveryAccountName}&quot;
              </strong>{' '}
              Delivery Account is ready.
            </p>
            <div className="mt-auto flex items-start gap-2 pt-8 text-sm leading-5 text-muted-foreground">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>You can return to Delivery Account settings at any time to adjust this configuration.</p>
            </div>
          </section>

          <section className="space-y-3 border-t border-border px-7 py-7 md:border-l md:border-t-0 md:px-8">
            <div className="mb-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
                Recommended setup
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-foreground">
                Continue configuring outbound delivery
              </h2>
            </div>

            <button type="button" className={actionClassName} onClick={onCreateOrder}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <ClipboardList className="size-4 text-muted-foreground" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Create a Lead Order</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Set a safe quantity, price, and initial order status.
                </span>
              </span>
            </button>

            <button type="button" className={actionClassName} onClick={onOpenCriteria}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <ListFilter className="size-4 text-muted-foreground" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Set Up Delivery Criteria</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Define which qualified leads can use this Delivery Account.
                </span>
              </span>
            </button>

            <button type="button" className={actionClassName} onClick={onEditDeliveryAccount}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <Settings2 className="size-4 text-muted-foreground" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Edit Delivery Account</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Review delivery, limits, revenue, offer, and advanced options.
                </span>
              </span>
            </button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
