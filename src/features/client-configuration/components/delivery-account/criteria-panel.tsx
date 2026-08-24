export function CriteriaPanel() {
  return (
    <div className="rounded-[4px] border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Delivery Criteria</p>
        <p className="text-xs text-muted-foreground">Changes save automatically</p>
      </div>
      <div className="flex min-h-40 items-center justify-center px-4 py-10 text-sm text-muted-foreground">
        No Criteria
      </div>
    </div>
  )
}
