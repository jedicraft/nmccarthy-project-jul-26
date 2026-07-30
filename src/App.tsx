import { useCallback, useEffect, useRef, useState } from 'react'
import { Board } from './components/Board.tsx'
import { SettingsModal } from './components/SettingsModal.tsx'
import { Toolbar } from './components/Toolbar.tsx'
import { WinModal } from './components/WinModal.tsx'
import { playSound, setSoundEnabled } from './audio/sounds.ts'
import { useGameEngine } from './hooks/useGameEngine.ts'
import { useSettings } from './hooks/useSettings.ts'
import { useStats } from './hooks/useStats.ts'
import { computeFinalScore } from './game/variants/klondike/scoring.ts'
import { InstallPrompt } from './pwa/InstallPrompt.tsx'
import { demoInsecureMerge } from './demo/scannerFindings.ts'
import './App.css'

// Demo-only: referenced so dependency + SAST findings stay in scope for security scans.
void demoInsecureMerge

function useGameTimer(active: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    startedAtRef.current = Date.now()
    setElapsedSeconds(0)

    const interval = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000),
        )
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [active])

  return elapsedSeconds
}

export default function App() {
  const { settings, updateSettings } = useSettings()
  const { stats, onGameStart, onGameWin, resetStats } = useStats()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [winDismissed, setWinDismissed] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const winRecordedRef = useRef(false)
  const gameStartedRef = useRef(false)

  const klondikeOptions = {
    drawCount: settings.drawCount,
    unlimitedRecycle: settings.unlimitedRecycle,
  }

  const engine = useGameEngine(klondikeOptions)
  const timerActive = gameKey > 0 && !engine.isWin
  const elapsedSeconds = useGameTimer(timerActive)

  useEffect(() => {
    setSoundEnabled(settings.sound)
  }, [settings.sound])

  const startNewGame = useCallback(() => {
    engine.newGame()
    onGameStart()
    setWinDismissed(false)
    winRecordedRef.current = false
    setGameKey((key) => key + 1)
  }, [engine, onGameStart])

  useEffect(() => {
    if (gameStartedRef.current) {
      return
    }
    gameStartedRef.current = true
    onGameStart()
    setGameKey(1)
  }, [onGameStart])

  useEffect(() => {
    if (engine.isWin && !winRecordedRef.current) {
      winRecordedRef.current = true
      const finalScore = computeFinalScore(
        engine.state,
        Math.max(0, 600 - elapsedSeconds),
      )
      onGameWin(elapsedSeconds, finalScore)
      if (settings.sound) {
        playSound('win')
      }
    }
  }, [
    elapsedSeconds,
    engine.isWin,
    engine.state,
    onGameWin,
    settings.sound,
  ])

  const handleUndo = useCallback(() => {
    if (engine.undo() && settings.sound) {
      playSound('undo')
    }
  }, [engine, settings.sound])

  const handleMove = useCallback(() => {
    if (settings.sound) {
      playSound('move')
    }
  }, [settings.sound])

  const handleDraw = useCallback(() => {
    if (settings.sound) {
      playSound('draw')
    }
  }, [settings.sound])

  const handleRecycle = useCallback(() => {
    if (settings.sound) {
      playSound('recycle')
    }
  }, [settings.sound])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'n') {
        event.preventDefault()
        startNewGame()
      } else if (key === 'u') {
        event.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, startNewGame])

  const showWinModal = engine.isWin && !winDismissed

  return (
    <div className="app">
      <Toolbar
        score={engine.state.score}
        elapsedSeconds={elapsedSeconds}
        canUndo={engine.canUndo}
        onNewGame={startNewGame}
        onUndo={handleUndo}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="app__main">
        <Board
          engine={engine}
          drawCount={settings.drawCount}
          showLogoBack={settings.logoBack}
          onMove={handleMove}
          onDraw={handleDraw}
          onRecycle={handleRecycle}
        />
      </main>

      <InstallPrompt />

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        stats={stats}
        onClose={() => setSettingsOpen(false)}
        onChange={updateSettings}
        onResetStats={resetStats}
      />

      <WinModal
        open={showWinModal}
        score={computeFinalScore(
          engine.state,
          Math.max(0, 600 - elapsedSeconds),
        )}
        elapsedSeconds={elapsedSeconds}
        onNewGame={startNewGame}
        onClose={() => setWinDismissed(true)}
      />
    </div>
  )
}
