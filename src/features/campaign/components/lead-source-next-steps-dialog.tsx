import { X } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Separator,
} from '@/components/ui'

const POSTING_INSTRUCTIONS_PREVIEW = `${import.meta.env.BASE_URL}assets/posting-instructions-preview.mp4`
const EDIT_CAMPAIGN_PREVIEW = `${import.meta.env.BASE_URL}assets/edit-campaign-preview.mp4`

interface LeadSourceNextStepsDialogProps {
  campaignName: string
  onClose: () => void
}

interface NextStepCardProps {
  videoSrc: string
  title: string
  description: string
  actionLabel: string
}

function NextStepCard({
  videoSrc,
  title,
  description,
  actionLabel,
}: NextStepCardProps) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[10px] border border-border bg-background md:w-[360px]">
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="h-60 w-full border-b border-border bg-muted object-cover"
      />
      <div className="flex flex-1 flex-col items-start gap-4 p-6">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs font-bold leading-4 text-primary">How To</p>
          <h3 className="text-base font-bold leading-6 text-foreground">{title}</h3>
          <p className="text-xs leading-4 text-muted-foreground">{description}</p>
        </div>
        <Button className="w-full">
          {actionLabel}
        </Button>
      </div>
    </article>
  )
}

/** Completion window shown after creating a lead source and its initial campaign. */
export function LeadSourceNextStepsDialog({
  campaignName,
  onClose,
}: LeadSourceNextStepsDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showClose={false}
        className="max-h-[90vh] max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-[915px]"
      >
        <header className="flex shrink-0 items-center justify-between px-4 py-2">
          <DialogTitle className="text-base font-bold leading-6 text-foreground">
            Next Steps
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </header>

        <DialogDescription className="sr-only">
          Choose what to do after creating the lead source and campaign.
        </DialogDescription>

        <Separator className="my-0" />

        <div className="flex min-h-0 flex-1 flex-col items-center gap-8 overflow-y-auto px-4 py-8 sm:p-12">
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <h2 className="text-[28px] font-bold leading-9 text-foreground">
              Your lead source has been created!
            </h2>
            <p className="text-base leading-6 text-foreground">
              Initial configuration of the <strong>&quot;{campaignName}&quot;</strong> campaign has been completed.
              <br />
              Now, you can continue...
            </p>
          </div>

          <div className="grid w-full max-w-[752px] grid-cols-1 justify-items-center gap-8 md:grid-cols-2">
            <NextStepCard
              videoSrc={POSTING_INSTRUCTIONS_PREVIEW}
              title="Generate Posting Instructions"
              description="Quickly generate posting instructions to send to your developer or affiliate partner."
              actionLabel="Show Instructions"
            />
            <NextStepCard
              videoSrc={EDIT_CAMPAIGN_PREVIEW}
              title="Edit Campaign Settings"
              description="Configure additional settings such as criteria, quantity limits, and additional lead validation options."
              actionLabel="Edit Campaign"
            />
          </div>
        </div>

        <Separator className="my-0" />

        <footer className="flex shrink-0 justify-end px-4 py-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
