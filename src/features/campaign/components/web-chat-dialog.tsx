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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const TABS = ['Properties', 'Integrations', 'Phone Settings', 'Intake Form'] as const
type WebChatTab = (typeof TABS)[number]

interface WebChatDialogProps {
  open: boolean
  onClose: () => void
}

export function WebChatDialog({ open, onClose }: WebChatDialogProps) {
  const [activeTab, setActiveTab] = useState<WebChatTab>('Properties')
  const [messageFlow, setMessageFlow] = useState('')
  const [showHeadingText, setShowHeadingText] = useState(false)
  const [showChatButton, setShowChatButton] = useState(false)
  const [autoShowChat, setAutoShowChat] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[960px] flex-col gap-0 overflow-hidden p-0 shadow-panel"
        showClose={false}
      >
        <DialogPanelHeader title="Web Chat Dialog" onClose={onClose} className="shrink-0 px-5 py-4" />
        <DialogDescription className="sr-only">
          Configure the visual properties of a web chat.
        </DialogDescription>

        <div className="shrink-0 px-5 pt-4">
          <div role="tablist" aria-label="Web Chat sections" className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-3 text-sm text-muted-foreground transition-colors',
                  activeTab === tab && 'border border-b-background bg-background text-primary -mb-px rounded-t-[4px]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {activeTab === 'Properties' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <FieldGroup label="Name">
                  <Input placeholder="Required" />
                </FieldGroup>
                <FieldGroup label="Message Flow">
                  <Select value={messageFlow} onValueChange={setMessageFlow}>
                    <SelectTrigger aria-label="Message Flow">
                      <SelectValue placeholder="-- Select Message Flow --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortgage-chat-flow">Mortgage Chat Flow</SelectItem>
                      <SelectItem value="main-message-flow">Main Message Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup label="Description">
                <Textarea className="min-h-24 resize-y" />
              </FieldGroup>

              <Separator />

              <div className="grid grid-cols-[1fr_112px_1fr] items-start gap-6">
                <FieldGroup label="Company Name">
                  <Input placeholder="Required" />
                </FieldGroup>
                <div className="flex flex-col items-center gap-2 pt-1">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/web-chat-agent.png`}
                    alt="Web chat agent"
                    className="size-[72px] rounded-full object-cover"
                  />
                  <Button size="sm" className="h-6 px-2 text-xs">Update Image</Button>
                </div>
                <FieldGroup label="Agent Name">
                  <Input placeholder="Required" />
                </FieldGroup>
              </div>

              <FieldGroup
                label="Initial Chat Message"
                description="The initial message displayed to the user before the chat starts (can be replaced by an intake form or first engagements)."
              >
                <Textarea
                  className="min-h-20 resize-y"
                  placeholder="Example: Hello! My name is Jennifer. Before we get started, can I get your first and last name?"
                />
              </FieldGroup>

              <Separator />

              <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4">
                <Switch
                  aria-label="Show Heading Text"
                  checked={showHeadingText}
                  onCheckedChange={setShowHeadingText}
                />
                <FieldGroup
                  label="Show Heading Text"
                  description="Brief description to show to the user at the top of the chat window"
                >
                  <Textarea disabled={!showHeadingText} className="min-h-16 resize-y" />
                </FieldGroup>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-8">
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4">
                  <Switch
                    aria-label="Show Chat Button"
                    checked={showChatButton}
                    onCheckedChange={setShowChatButton}
                  />
                  <div>
                    <p className="text-sm leading-5 text-foreground">Show Chat Button</p>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Display chat button in the corner of the window
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4">
                  <Switch
                    aria-label="Auto Show Chat"
                    checked={autoShowChat}
                    onCheckedChange={setAutoShowChat}
                  />
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm leading-5 text-foreground">Auto Show Chat</p>
                      <p className="text-xs leading-4 text-muted-foreground">
                        Automatically display the chat window after the delay
                      </p>
                    </div>
                    <Input disabled={!autoShowChat} placeholder="0 Seconds" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
              {activeTab} settings are represented by this tab.
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
