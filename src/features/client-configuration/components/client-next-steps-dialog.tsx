import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { CircleCheck, CircleHelp } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { ClientWalkthroughVideo, type ClientWalkthrough } from './client-walkthrough-video'

interface ClientNextStepsDialogProps {
  deliveryAccountName: string
  onCreateOrder: () => void
  onOpenCriteria: () => void
  onCreateDeliveryMethod: () => void
  onClose: () => void
}

interface ClientNextStep {
  id: ClientWalkthrough
  navigationLabel: string
  navigationDescription: string
  videoTitle: string
  heading: string
  paragraph: string
  actionLabel: string
}

const CLIENT_NEXT_STEPS: ClientNextStep[] = [
  {
    id: 'criteria',
    navigationLabel: 'Delivery Criteria',
    navigationDescription: 'Define qualified leads',
    videoTitle: 'Delivery criteria configuration walkthrough',
    heading: 'Set Up Delivery Criteria',
    paragraph:
      'Define which qualified leads can use this Delivery Account by adding the fields, operators, and values that match the client’s requirements.',
    actionLabel: 'Configure Delivery Criteria',
  },
  {
    id: 'order',
    navigationLabel: 'Lead Order',
    navigationDescription: 'Set quantity or budget',
    videoTitle: 'Lead order configuration walkthrough',
    heading: 'Create a Lead Order',
    paragraph:
      'Create an order for a set number of leads or a fixed dollar budget. Quantity orders can use the Delivery Account price or an order-specific price.',
    actionLabel: 'Create Lead Order',
  },
  {
    id: 'delivery-method',
    navigationLabel: 'Delivery Method',
    navigationDescription: 'Add another method',
    videoTitle: 'Delivery method configuration walkthrough',
    heading: 'Create an Additional Delivery Method',
    paragraph:
      'Lead Portal is already configured for this account. Add another Delivery Method only when the client needs leads sent another way, such as by Webhook.',
    actionLabel: 'Add Delivery Method',
  },
]

export function ClientNextStepsDialog({
  deliveryAccountName,
  onCreateOrder,
  onOpenCriteria,
  onCreateDeliveryMethod,
  onClose,
}: ClientNextStepsDialogProps) {
  const [activeOptionId, setActiveOptionId] = useState<ClientNextStep['id']>('criteria')
  const dialogRef = useRef<HTMLDivElement>(null)
  const activeOption = CLIENT_NEXT_STEPS.find((option) => option.id === activeOptionId) ?? CLIENT_NEXT_STEPS[0]

  const openActiveOption = () => {
    if (activeOption.id === 'criteria') onOpenCriteria()
    if (activeOption.id === 'order') onCreateOrder()
    if (activeOption.id === 'delivery-method') onCreateDeliveryMethod()
  }

  const handleOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    optionIndex: number,
  ) => {
    let nextIndex = optionIndex

    if (event.key === 'ArrowRight') nextIndex = (optionIndex + 1) % CLIENT_NEXT_STEPS.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (optionIndex - 1 + CLIENT_NEXT_STEPS.length) % CLIENT_NEXT_STEPS.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = CLIENT_NEXT_STEPS.length - 1
    if (nextIndex === optionIndex) return

    event.preventDefault()
    const nextOption = CLIENT_NEXT_STEPS[nextIndex]
    setActiveOptionId(nextOption.id)
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(nextIndex)
      .focus()
  }

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        ref={dialogRef}
        tabIndex={-1}
        showClose={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          dialogRef.current?.focus()
        }}
        className="max-h-[92vh] max-w-[95vw] gap-0 overflow-hidden p-0 focus:outline-none sm:max-w-[960px]"
      >
        <DialogPanelHeader
          title="Client Created"
          onClose={onClose}
          className="shrink-0 px-5 py-2.5 [&>button]:size-11"
        />
        <DialogDescription className="sr-only">
          Client creation completed. Review the outbound configuration walkthrough.
        </DialogDescription>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_2fr]">
          <section className="flex min-h-[360px] flex-col px-7 py-7 md:min-h-[460px] md:px-8">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary-light text-primary">
              <CircleCheck className="size-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 text-foreground">
              Your client has been created!
            </h2>
            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              {deliveryAccountName.trim() ? (
                <>
                  Your client profile, Lead Portal, and initial{' '}
                  <strong className="font-semibold text-foreground">
                    &quot;{deliveryAccountName}&quot;
                  </strong>{' '}
                  Delivery Account have been created successfully.
                </>
              ) : (
                'Your client profile, Lead Portal, and initial Delivery Account have been created successfully.'
              )}
            </p>
            <div className="mt-auto flex items-start gap-2 pt-8 text-sm leading-5 text-muted-foreground">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>
                You can always return to Delivery Account Settings later to make updates or
                adjustments.
              </p>
            </div>
          </section>

          <section className="border-t border-border px-7 py-7 md:border-l md:border-t-0 md:px-8">
            <div
              id="client-next-step-panel"
              role="tabpanel"
              aria-labelledby={`client-next-step-${activeOption.id}`}
              aria-live="polite"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
                Next steps
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-foreground">
                {activeOption.heading}
              </h2>
              <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">
                {activeOption.paragraph}
              </p>

              <div
                className="mt-5 aspect-video overflow-hidden rounded-md border border-border bg-muted"
              >
                <ClientWalkthroughVideo
                  walkthrough={activeOption.id}
                  title={activeOption.videoTitle}
                />
              </div>
            </div>

            <nav
              role="tablist"
              className="mt-4 grid w-full grid-cols-3 gap-2"
              aria-label="Client configuration options"
            >
              {CLIENT_NEXT_STEPS.map((option, optionIndex) => (
                <button
                  key={option.id}
                  id={`client-next-step-${option.id}`}
                  type="button"
                  role="tab"
                  aria-selected={option.id === activeOption.id}
                  aria-controls="client-next-step-panel"
                  tabIndex={option.id === activeOption.id ? 0 : -1}
                  onClick={() => setActiveOptionId(option.id)}
                  onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
                  className={cn(
                    'group min-h-[58px] border-t bg-transparent px-3 py-2 text-left shadow-none transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    option.id === activeOption.id
                      ? 'border-t-primary hover:bg-background-tertiary'
                      : 'border-t-transparent hover:border-t-border hover:bg-background-tertiary active:border-t-primary active:bg-muted/50',
                  )}
                >
                  <span
                    className={cn(
                      'block text-sm font-medium leading-5',
                      option.id === activeOption.id ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {option.navigationLabel}
                  </span>
                  <span
                    className={cn(
                      'block text-xs leading-4 transition-colors',
                      option.id === activeOption.id
                        ? 'text-text-medium'
                        : 'text-muted-foreground group-hover:text-text-medium',
                    )}
                  >
                    {option.navigationDescription}
                  </span>
                </button>
              ))}
            </nav>
          </section>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-border px-5 py-3">
          <Button onClick={openActiveOption} className="min-w-[190px]">
            {activeOption.actionLabel}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
