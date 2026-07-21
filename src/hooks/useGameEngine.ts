import { useCallback, useMemo, useRef, useState } from 'react'
import { GameEngine } from '../game/core/engine.ts'
import type { GameState, KlondikeOptions, Move } from '../game/core/types.ts'
import { KLONDIKE_PILE_IDS } from '../game/core/types.ts'
import {
  DEFAULT_KLONDIKE_OPTIONS,
  klondikeVariant,
} from '../game/variants/klondike/index.ts'

function findFoundationMove(state: GameState, fromPileId: string): Move | null {
  const moves = klondikeVariant.getLegalMoves(state)
  return (
    moves.find(
      (move) =>
        move.type === 'move' &&
        move.from === fromPileId &&
        move.to?.startsWith('foundation-') &&
        move.count === 1,
    ) ?? null
  )
}

function findMoveToPile(
  state: GameState,
  fromPileId: string,
  toPileId: string,
  cardIndex?: number,
): Move | null {
  const moves = klondikeVariant.getLegalMoves(state)
  const fromPile = state.piles[fromPileId]
  if (!fromPile) {
    return null
  }

  const candidates = moves.filter(
    (move) =>
      move.type === 'move' && move.from === fromPileId && move.to === toPileId,
  )

  if (candidates.length === 0) {
    return null
  }

  if (cardIndex !== undefined) {
    const count = fromPile.cards.length - cardIndex
    return candidates.find((move) => move.count === count) ?? null
  }

  return candidates[0] ?? null
}

export interface UseGameEngineResult {
  state: GameState
  newGame: (seed?: number) => void
  applyMove: (move: Move) => boolean
  undo: () => boolean
  canUndo: boolean
  isWin: boolean
  drawFromStock: () => boolean
  recycleStock: () => boolean
  autoMoveToFoundation: (fromPileId: string) => boolean
  moveToPile: (
    fromPileId: string,
    toPileId: string,
    cardIndex?: number,
  ) => boolean
  getLegalMoves: () => Move[]
}

export function useGameEngine(options: KlondikeOptions): UseGameEngineResult {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const engineRef = useRef<GameEngine<KlondikeOptions> | null>(null)
  if (!engineRef.current) {
    engineRef.current = new GameEngine({
      variant: klondikeVariant,
      options: optionsRef.current ?? DEFAULT_KLONDIKE_OPTIONS,
    })
  }

  const [state, setState] = useState<GameState>(() =>
    engineRef.current!.getState(),
  )

  const syncState = useCallback(() => {
    setState(engineRef.current!.getState())
  }, [])

  const newGame = useCallback((seed = Date.now()) => {
    engineRef.current!.newGame(seed, optionsRef.current)
    syncState()
  }, [syncState])

  const applyMove = useCallback(
    (move: Move): boolean => {
      const result = engineRef.current!.applyMove(move)
      if (!result) {
        return false
      }
      syncState()
      return true
    },
    [syncState],
  )

  const undo = useCallback((): boolean => {
    const result = engineRef.current!.undo()
    if (!result) {
      return false
    }
    syncState()
    return true
  }, [syncState])

  const drawFromStock = useCallback((): boolean => {
    return applyMove({ type: 'draw' })
  }, [applyMove])

  const recycleStock = useCallback((): boolean => {
    return applyMove({ type: 'recycle' })
  }, [applyMove])

  const autoMoveToFoundation = useCallback(
    (fromPileId: string): boolean => {
      const move = findFoundationMove(engineRef.current!.getState(), fromPileId)
      return move ? applyMove(move) : false
    },
    [applyMove],
  )

  const moveToPile = useCallback(
    (fromPileId: string, toPileId: string, cardIndex?: number): boolean => {
      const move = findMoveToPile(
        engineRef.current!.getState(),
        fromPileId,
        toPileId,
        cardIndex,
      )
      return move ? applyMove(move) : false
    },
    [applyMove],
  )

  const getLegalMoves = useCallback(
    () => engineRef.current!.getLegalMoves(),
    [],
  )

  const canUndo = engineRef.current.canUndo()
  const isWin = state.won

  return useMemo(
    () => ({
      state,
      newGame,
      applyMove,
      undo,
      canUndo,
      isWin,
      drawFromStock,
      recycleStock,
      autoMoveToFoundation,
      moveToPile,
      getLegalMoves,
    }),
    [
      state,
      newGame,
      applyMove,
      undo,
      canUndo,
      isWin,
      drawFromStock,
      recycleStock,
      autoMoveToFoundation,
      moveToPile,
      getLegalMoves,
    ],
  )
}

export { KLONDIKE_PILE_IDS }
