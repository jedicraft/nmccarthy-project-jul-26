import { computeTimeBonus } from '../game/variants/klondike/scoring.ts'

export interface WinModalProps {
  open: boolean
  score: number
  elapsedSeconds: number
  onNewGame: () => void
  onClose: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function WinModal({
  open,
  score,
  elapsedSeconds,
  onNewGame,
  onClose,
}: WinModalProps) {
  if (!open) {
    return null
  }

  const timeBonus = computeTimeBonus(Math.max(0, 600 - elapsedSeconds))

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal modal--win"
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-title"
      >
        <header className="modal__header">
          <h2 id="win-title">You win!</h2>
        </header>
        <div className="modal__body">
          <p className="win-message">Congratulations — all cards are on the foundations.</p>
          <dl className="stats-list">
            <div>
              <dt>Time</dt>
              <dd>{formatTime(elapsedSeconds)}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>{score}</dd>
            </div>
            {timeBonus > 0 ? (
              <div>
                <dt>Time bonus</dt>
                <dd>+{timeBonus}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <footer className="modal__footer">
          <button type="button" className="btn" onClick={onNewGame}>
            Play again
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}
