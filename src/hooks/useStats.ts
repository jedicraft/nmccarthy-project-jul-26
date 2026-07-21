import { useCallback, useState } from 'react'
import {
  DEFAULT_STATS,
  loadStats,
  recordGameStart,
  recordLoss,
  recordWin,
  saveStats,
  type GameStats,
} from '../storage/stats.ts'

export function useStats() {
  const [stats, setStatsState] = useState<GameStats>(() => loadStats())

  const persist = useCallback((next: GameStats) => {
    setStatsState(next)
    saveStats(next)
  }, [])

  const onGameStart = useCallback(() => {
    setStatsState((current) => {
      const next = recordGameStart(current)
      saveStats(next)
      return next
    })
  }, [])

  const onGameWin = useCallback((timeSeconds: number, score: number) => {
    setStatsState((current) => {
      const next = recordWin(current, timeSeconds, score)
      saveStats(next)
      return next
    })
  }, [])

  const onGameLoss = useCallback(() => {
    setStatsState((current) => {
      const next = recordLoss(current)
      saveStats(next)
      return next
    })
  }, [])

  const resetStats = useCallback(() => {
    persist({ ...DEFAULT_STATS })
  }, [persist])

  return {
    stats,
    onGameStart,
    onGameWin,
    onGameLoss,
    resetStats,
  }
}
