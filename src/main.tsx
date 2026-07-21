import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { loadSettings } from './storage/settings.ts'
import { applyTheme } from './themes/themes.ts'
import './themes/themes.css'
import './index.css'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const settings = loadSettings()
    applyTheme(settings.theme)
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
