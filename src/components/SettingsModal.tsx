import { THEMES } from '../themes/themes.ts'
import type { Settings } from '../storage/settings.ts'
import type { GameStats } from '../storage/stats.ts'

export interface SettingsModalProps {
  open: boolean
  settings: Settings
  stats: GameStats
  onClose: () => void
  onChange: (patch: Partial<Settings>) => void
  onResetStats: () => void
}

export function SettingsModal({
  open,
  settings,
  stats,
  onClose,
  onChange,
  onResetStats,
}: SettingsModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="modal__header">
          <h2 id="settings-title">Settings</h2>
          <button
            type="button"
            className="btn btn--icon"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </header>

        <div className="modal__body">
          <section className="settings-section">
            <h3>Game</h3>
            <label className="field">
              <span>Draw count</span>
              <select
                value={settings.drawCount}
                onChange={(event) =>
                  onChange({
                    drawCount: Number(event.target.value) === 3 ? 3 : 1,
                  })
                }
              >
                <option value={1}>Draw 1</option>
                <option value={3}>Draw 3</option>
              </select>
            </label>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={settings.unlimitedRecycle}
                onChange={(event) =>
                  onChange({ unlimitedRecycle: event.target.checked })
                }
              />
              <span>Unlimited stock recycle</span>
            </label>
          </section>

          <section className="settings-section">
            <h3>Appearance</h3>
            <label className="field">
              <span>Theme</span>
              <select
                value={settings.theme}
                onChange={(event) =>
                  onChange({
                    theme: event.target.value as Settings['theme'],
                  })
                }
              >
                {THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={settings.logoBack}
                onChange={(event) =>
                  onChange({ logoBack: event.target.checked })
                }
              />
              <span>Show logo on card backs</span>
            </label>
          </section>

          <section className="settings-section">
            <h3>Audio</h3>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(event) => onChange({ sound: event.target.checked })}
              />
              <span>Sound effects</span>
            </label>
          </section>

          <section className="settings-section">
            <h3>Statistics</h3>
            <dl className="stats-list">
              <div>
                <dt>Games played</dt>
                <dd>{stats.gamesPlayed}</dd>
              </div>
              <div>
                <dt>Games won</dt>
                <dd>{stats.gamesWon}</dd>
              </div>
              <div>
                <dt>Best time</dt>
                <dd>
                  {stats.bestTimeSeconds === null
                    ? '—'
                    : `${Math.floor(stats.bestTimeSeconds / 60)}:${(stats.bestTimeSeconds % 60).toString().padStart(2, '0')}`}
                </dd>
              </div>
              <div>
                <dt>Best score</dt>
                <dd>{stats.bestScore ?? '—'}</dd>
              </div>
              <div>
                <dt>Win streak</dt>
                <dd>
                  {stats.currentStreak} (best {stats.bestStreak})
                </dd>
              </div>
            </dl>
            <button type="button" className="btn btn--danger" onClick={onResetStats}>
              Reset statistics
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
