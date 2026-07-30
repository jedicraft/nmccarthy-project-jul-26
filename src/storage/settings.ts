import {
  isBackgroundId,
  type BackgroundId,
} from '../themes/backgrounds.ts'

export type ThemeId = 'classic' | 'dark' | 'minimal'

export type { BackgroundId }

export interface Settings {
  drawCount: 1 | 3
  theme: ThemeId
  background: BackgroundId
  sound: boolean
  unlimitedRecycle: boolean
  logoBack: boolean
}

const STORAGE_KEY = 'solitaire-settings'

export const DEFAULT_SETTINGS: Settings = {
  drawCount: 1,
  theme: 'classic',
  background: 'felt',
  sound: true,
  unlimitedRecycle: true,
  logoBack: true,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_SETTINGS }
    }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      drawCount: parsed.drawCount === 3 ? 3 : 1,
      theme:
        parsed.theme === 'dark' || parsed.theme === 'minimal'
          ? parsed.theme
          : 'classic',
      background:
        parsed.background && isBackgroundId(parsed.background)
          ? parsed.background
          : 'felt',
      sound: parsed.sound !== false,
      unlimitedRecycle: parsed.unlimitedRecycle !== false,
      logoBack: parsed.logoBack !== false,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
