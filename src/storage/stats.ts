export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  bestTimeSeconds: number | null
  bestScore: number | null
  currentStreak: number
  bestStreak: number
}

const STORAGE_KEY = 'solitaire-stats'

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimeSeconds: null,
  bestScore: null,
  currentStreak: 0,
  bestStreak: 0,
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_STATS }
    }
    const parsed = JSON.parse(raw) as Partial<GameStats>
    return {
      gamesPlayed: parsed.gamesPlayed ?? 0,
      gamesWon: parsed.gamesWon ?? 0,
      bestTimeSeconds:
        typeof parsed.bestTimeSeconds === 'number'
          ? parsed.bestTimeSeconds
          : null,
      bestScore:
        typeof parsed.bestScore === 'number' ? parsed.bestScore : null,
      currentStreak: parsed.currentStreak ?? 0,
      bestStreak: parsed.bestStreak ?? 0,
    }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function recordGameStart(stats: GameStats): GameStats {
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
  }
}

export function recordWin(
  stats: GameStats,
  timeSeconds: number,
  score: number,
): GameStats {
  const currentStreak = stats.currentStreak + 1
  return {
    ...stats,
    gamesWon: stats.gamesWon + 1,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    bestTimeSeconds:
      stats.bestTimeSeconds === null
        ? timeSeconds
        : Math.min(stats.bestTimeSeconds, timeSeconds),
    bestScore:
      stats.bestScore === null ? score : Math.max(stats.bestScore, score),
  }
}

export function recordLoss(stats: GameStats): GameStats {
  return {
    ...stats,
    currentStreak: 0,
  }
}
