import { useRef } from 'react'
import { CircleCheck, CircleHelp } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPanelHeader,
} from '@/components/ui'
import type { Channel } from '../types'
import { CampaignWalkthroughVideo } from './campaign-walkthrough-video'

interface ChannelNextStep {
  heading: string
  paragraph: string
}

const NEXT_STEPS_BY_CHANNEL: Record<Channel, ChannelNextStep> = {
  web: {
    heading: 'Review General Settings',
    paragraph: 'Continue to the Campaign Settings screen to review your configuration and customize any additional campaign options.',
  },
  'ping-post': {
    heading: 'Configure PING Options',
    paragraph: "Next, open the PING Options tab to configure your ping requirements. Before your campaign can accept ping requests, you'll need to define the PING Field Requirements by selecting the lead fields to be included in the ping requests from your lead source. You can also configure optional revenue, profit, and delivery requirements as needed.",
  },
  phone: {
    heading: 'Add a Phone Number',
    paragraph: 'Next, open the Phone Numbers tab to add a phone number for this campaign. Select an existing IVR number or purchase a new one, then assign a call flow to complete your phone campaign configuration.',
  },
  chat: {
    heading: 'Configure Web Chats',
    paragraph: 'Next, open the Web Chats tab to configure your chat settings. From there, you can customize your chat experience, including the welcome message, appearance, integrations, and other available options.',
  },
}

interface LeadSourceNextStepsDialogProps {
  campaignName: string
  channel: Channel
  onClose: () => void
  onNext: () => void
}

/** Completion window shown after creating a lead source and its initial campaign. */
export function LeadSourceNextStepsDialog({
  campaignName,
  channel,
  onClose,
  onNext,
}: LeadSourceNextStepsDialogProps) {
  const nextStep = NEXT_STEPS_BY_CHANNEL[channel]
  const dialogRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
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
          title="Lead Source Created"
          onClose={onClose}
          className="shrink-0 px-5 py-2.5 [&>button]:size-11"
        />
        <DialogDescription className="sr-only">
          Lead source creation completed. Continue to channel-specific campaign settings.
        </DialogDescription>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_2fr]">
          <section
            data-region="creation-confirmation"
            className="flex min-h-[360px] flex-col px-7 py-7 md:min-h-[460px] md:px-8"
          >
            <div
              data-slot="lead-source-success-icon"
              className="flex size-9 items-center justify-center rounded-full bg-primary-light text-primary"
            >
              <CircleCheck className="size-5" aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-[28px] font-semibold leading-9 text-foreground">
              Your lead source has been created!
            </h2>

            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              Your lead source and initial campaign configuration for{' '}
              <strong className="font-semibold text-foreground">&quot;{campaignName}&quot;</strong>{' '}
              have been created successfully.
            </p>

            <div className="mt-auto flex items-start gap-2 pt-8 text-sm leading-5 text-muted-foreground">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>You can always return to the Campaign Settings later to make updates or adjustments.</p>
            </div>
          </section>

          <section
            data-region="channel-next-step"
            className="border-t border-border px-7 py-7 md:border-l md:border-t-0 md:px-8"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
              Next step
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-7 text-foreground">
              {nextStep.heading}
            </h2>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {nextStep.paragraph}
            </p>

            <div className="mt-5 overflow-hidden rounded-md border border-border bg-muted">
              <CampaignWalkthroughVideo
                channel={channel}
                title={`${nextStep.heading} walkthrough`}
              />
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-border px-5 py-3">
          <Button onClick={onNext} className="min-w-[170px]">
            Configure Campaign
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
