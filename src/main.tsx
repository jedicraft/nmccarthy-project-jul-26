import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { loadSettings } from './storage/settings.ts'
import { applyBackground } from './themes/backgrounds.ts'
import { applyTheme } from './themes/themes.ts'
import './themes/themes.css'
import './themes/backgrounds.css'
import './index.css'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const settings = loadSettings()
    applyTheme(settings.theme)
    applyBackground(settings.background)
  }, [])

  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
