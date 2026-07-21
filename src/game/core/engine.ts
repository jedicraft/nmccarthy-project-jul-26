import type { GameState, Move, SolitaireVariant } from './types.ts'
import { cloneState } from './types.ts'

const MAX_UNDO_HISTORY = 200

export interface GameEngineOptions<TVariantOptions> {
  variant: SolitaireVariant<TVariantOptions>
  seed?: number
  options: TVariantOptions
}

export class GameEngine<TVariantOptions = unknown> {
  readonly variant: SolitaireVariant<TVariantOptions>

  private state: GameState
  private undoStack: GameState[] = []

  constructor(config: GameEngineOptions<TVariantOptions>) {
    this.variant = config.variant
    this.state = this.variant.createInitialState(
      config.seed ?? Date.now(),
      config.options,
    )
  }

  getState(): GameState {
    return this.variant.cloneState(this.state)
  }

  newGame(seed: number, options: TVariantOptions): GameState {
    this.undoStack = []
    this.state = this.variant.createInitialState(seed, options)
    return this.getState()
  }

  getLegalMoves(): Move[] {
    return this.variant.getLegalMoves(this.state)
  }

  canApplyMove(move: Move): boolean {
    return this.variant.applyMove(this.state, move) !== null
  }

  applyMove(move: Move): GameState | null {
    const snapshot = cloneState(this.state)
    const nextState = this.variant.applyMove(this.state, move)

    if (!nextState) {
      return null
    }

    this.undoStack.push(snapshot)
    if (this.undoStack.length > MAX_UNDO_HISTORY) {
      this.undoStack.shift()
    }

    this.state = nextState
    return this.getState()
  }

  undo(): GameState | null {
    const previous = this.undoStack.pop()
    if (!previous) {
      return null
    }

    this.state = previous
    return this.getState()
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  isWin(): boolean {
    return this.variant.isWin(this.state)
  }
}
