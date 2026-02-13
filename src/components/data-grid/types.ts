export interface DataGridColumn<T> {
  key: keyof T & string
  header: string
  width?: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}
