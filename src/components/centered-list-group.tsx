import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CenteredListGroupItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  href?: string
  onAction?: () => void
}

interface CenteredListGroupProps {
  heading?: string
  items: CenteredListGroupItem[]
  className?: string
}

export function CenteredListGroup({
  heading,
  items,
  className,
}: CenteredListGroupProps) {
  return (
    <main
      className={cn(
        'flex flex-1 items-center justify-center',
        className,
      )}
    >
      <div className="w-full max-w-sm space-y-3">
        {heading && (
          <p className="text-sm text-muted-foreground px-1">{heading}</p>
        )}
        {items.map((item) => {
          const content = (
            <>
              {item.icon}
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.label}</span>
                {item.description && (
                  <p className="text-muted-foreground font-normal">{item.description}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )

          return item.href ? (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-accent"
            >
              {content}
            </a>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={item.onAction}
              className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-left transition-colors hover:bg-accent"
            >
              {content}
            </button>
          )
        })}
      </div>
    </main>
  )
}
