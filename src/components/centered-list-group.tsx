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
  layout?: 'list' | 'cards'
}

export function CenteredListGroup({
  heading,
  items,
  className,
  layout = 'list',
}: CenteredListGroupProps) {
  const isCards = layout === 'cards'

  return (
    <main
      className={cn(
        'flex flex-1 items-center justify-center',
        className,
      )}
    >
      <div className={cn('w-full', isCards ? 'max-w-4xl space-y-4 px-4' : 'max-w-sm space-y-3')}>
        {heading && (
          <p className={cn(
            'px-1 text-sm text-muted-foreground',
            isCards && 'font-medium',
          )}>
            {heading}
          </p>
        )}
        <div className={cn(isCards ? 'grid gap-3 md:grid-cols-3' : 'space-y-3')}>
          {items.map((item) => {
            const content = isCards ? (
              <>
                {item.icon && (
                  <span className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/40">
                    {item.icon}
                  </span>
                )}
                <div className="min-w-0 space-y-1.5">
                  <span className="block text-sm font-semibold leading-5 text-foreground">
                    {item.label}
                  </span>
                  {item.description && (
                    <p className="text-sm font-normal leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                  Start
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </span>
              </>
            ) : (
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

            const className = isCards
              ? 'flex min-h-[196px] flex-col items-start gap-4 rounded-md border border-border bg-background p-5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              : 'flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-accent'

            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                className={className}
              >
                {content}
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={item.onAction}
                className={cn('w-full', className)}
              >
                {content}
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
