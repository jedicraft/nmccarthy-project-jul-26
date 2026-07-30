import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from '../storage/settings.ts'
import { applyBackground } from '../themes/backgrounds.ts'
import { applyTheme } from '../themes/themes.ts'
import { setSoundEnabled } from '../audio/sounds.ts'

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    applyTheme(settings.theme)
    applyBackground(settings.background)
    setSoundEnabled(settings.sound)
  }, [settings.theme, settings.background, settings.sound])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((current) => {
      const next = { ...current, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
