import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || hidden) {
    return null
  }

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setHidden(true)
  }

  return (
    <div className="install-prompt">
      <span>Install Solitaire for quick access</span>
      <button type="button" className="btn" onClick={handleInstall}>
        Install
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => setHidden(true)}
      >
        Not now
      </button>
    </div>
  )
}
