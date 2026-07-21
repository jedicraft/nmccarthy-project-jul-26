import type { GameState, Move } from '../../core/types.ts'
import { KLONDIKE_PILE_IDS } from '../../core/types.ts'

export const SCORING = {
  wasteToTableau: 5,
  wasteToFoundation: 10,
  tableauToFoundation: 10,
  foundationToTableau: -15,
  flipTableauCard: 5,
  recycleStock: -100,
} as const

function isFoundation(pileId: string): boolean {
  return pileId.startsWith('foundation-')
}

function isTableau(pileId: string): boolean {
  return pileId.startsWith('tableau-')
}

export function scoreMove(previous: GameState, move: Move, next: GameState): number {
  if (move.type === 'recycle') {
    return SCORING.recycleStock
  }

  if (move.type === 'draw') {
    return 0
  }

  if (move.type !== 'move' || !move.from || !move.to) {
    return 0
  }

  let delta = 0

  if (move.from === KLONDIKE_PILE_IDS.waste && isTableau(move.to)) {
    delta += SCORING.wasteToTableau
  } else if (move.from === KLONDIKE_PILE_IDS.waste && isFoundation(move.to)) {
    delta += SCORING.wasteToFoundation
  } else if (isTableau(move.from) && isFoundation(move.to)) {
    delta += SCORING.tableauToFoundation
  } else if (isFoundation(move.from) && isTableau(move.to)) {
    delta += SCORING.foundationToTableau
  }

  if (isTableau(move.from)) {
    const previousPile = previous.piles[move.from]
    const nextPile = next.piles[move.from]
    if (previousPile && nextPile) {
      const flipped = nextPile.cards.some(
        (card, index) => card.faceUp && previousPile.cards[index]?.faceUp === false,
      )
      if (flipped) {
        delta += SCORING.flipTableauCard
      }
    }
  }

  return delta
}

export function computeTimeBonus(secondsRemaining: number): number {
  return Math.max(0, Math.floor(secondsRemaining / 10) * 700)
}

export function computeFinalScore(state: GameState, secondsRemaining = 0): number {
  return state.score + computeTimeBonus(secondsRemaining)
}
