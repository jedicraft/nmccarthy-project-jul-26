import type { ThemeId } from '../storage/settings.ts'

export interface ThemeDefinition {
  id: ThemeId
  label: string
}

export const THEMES: ThemeDefinition[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'dark', label: 'Dark' },
  { id: 'minimal', label: 'Minimal' },
]

export function applyTheme(themeId: ThemeId): void {
  document.documentElement.dataset.theme = themeId
}
