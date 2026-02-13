import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

export const useThemeStore = create<ThemeStore>((set) => {
  const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null
  const theme = stored ?? 'light'
  const resolved = theme === 'system' ? getSystemTheme() : theme

  // Apply on init
  if (typeof document !== 'undefined') {
    applyTheme(resolved)
  }

  return {
    theme,
    resolvedTheme: resolved,
    setTheme: (newTheme: Theme) => {
      const newResolved = newTheme === 'system' ? getSystemTheme() : newTheme
      localStorage.setItem('theme', newTheme)
      applyTheme(newResolved)
      set({ theme: newTheme, resolvedTheme: newResolved })
    },
  }
})

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState()
    if (store.theme === 'system') {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useThemeStore.setState({ resolvedTheme: resolved })
    }
  })
}
