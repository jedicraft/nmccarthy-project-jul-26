export interface ToolbarProps {
  score: number
  elapsedSeconds: number
  canUndo: boolean
  onNewGame: () => void
  onUndo: () => void
  onOpenSettings: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function Toolbar({
  score,
  elapsedSeconds,
  canUndo,
  onNewGame,
  onUndo,
  onOpenSettings,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__left">
        <h1 className="toolbar__title">Harness Solitaire</h1>
      </div>

      <div className="toolbar__stats">
        <div className="toolbar__stat">
          <span className="toolbar__stat-label">Time</span>
          <span className="toolbar__stat-value">{formatTime(elapsedSeconds)}</span>
        </div>
        <div className="toolbar__stat">
          <span className="toolbar__stat-label">Score</span>
          <span className="toolbar__stat-value">{score}</span>
        </div>
      </div>

      <div className="toolbar__actions">
        <button type="button" className="btn" onClick={onNewGame}>
          New Game
        </button>
        <button
          type="button"
          className="btn"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
