import { SectionHeading } from '@/components/ui/field-group'
import { Separator } from '@/components/ui/separator'

export function PostbackSettings() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Postback Settings" />
      <Separator className="my-0" />
      <div className="rounded-[4px] border border-dashed border-border bg-muted/20 px-5 py-8">
        <p className="text-sm leading-5 text-muted-foreground">
          Postback settings placeholder.
        </p>
      </div>
    </div>
  )
}
