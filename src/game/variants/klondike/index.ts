import type { GameState, KlondikeOptions, Move, SolitaireVariant } from '../../core/types.ts'
import { cloneState } from '../../core/types.ts'
import {
  applyMove,
  dealKlondike,
  getLegalMoves,
  isWin,
} from './rules.ts'

export const klondikeVariant: SolitaireVariant<KlondikeOptions> = {
  id: 'klondike',
  createInitialState: dealKlondike,
  cloneState,
  getLegalMoves,
  applyMove,
  isWin,
}

export type { KlondikeOptions, GameState, Move }

export {
  applyMove,
  dealKlondike,
  getLegalMoves,
  isWin,
  createRankRun,
  createTestState,
} from './rules.ts'

export {
  SCORING,
  scoreMove,
  computeFinalScore,
  computeTimeBonus,
} from './scoring.ts'

export const DEFAULT_KLONDIKE_OPTIONS: KlondikeOptions = {
  drawCount: 1,
  unlimitedRecycle: true,
}
