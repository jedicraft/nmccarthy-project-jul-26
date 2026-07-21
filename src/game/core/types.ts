export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export type Suit = (typeof SUITS)[number]

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
export type Rank = (typeof RANKS)[number]

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export interface Pile {
  id: string
  cards: Card[]
}

export interface KlondikeOptions {
  drawCount: 1 | 3
  unlimitedRecycle: boolean
}

export interface GameState {
  piles: Record<string, Pile>
  seed: number
  variantId: string
  options: KlondikeOptions
  score: number
  moveCount: number
  recycleCount: number
  won: boolean
}

export type MoveType = 'move' | 'draw' | 'recycle' | 'flip'

export interface Move {
  type: MoveType
  from?: string
  to?: string
  count?: number
  pileId?: string
  cardIndex?: number
}

export interface SolitaireVariant<TOptions = KlondikeOptions> {
  id: string
  createInitialState: (seed: number, options: TOptions) => GameState
  cloneState: (state: GameState) => GameState
  getLegalMoves: (state: GameState) => Move[]
  applyMove: (state: GameState, move: Move) => GameState | null
  isWin: (state: GameState) => boolean
}

export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return {
    id: `${suit}-${rank}`,
    suit,
    rank,
    faceUp,
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank))
    }
  }
  return deck
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds'
}

export function isBlackSuit(suit: Suit): boolean {
  return !isRedSuit(suit)
}

export function oppositeColor(a: Suit, b: Suit): boolean {
  return isRedSuit(a) !== isRedSuit(b)
}

export function cloneCard(card: Card): Card {
  return { ...card }
}

export function clonePile(pile: Pile): Pile {
  return {
    id: pile.id,
    cards: pile.cards.map(cloneCard),
  }
}

export function cloneState(state: GameState): GameState {
  const piles: Record<string, Pile> = {}
  for (const [id, pile] of Object.entries(state.piles)) {
    piles[id] = clonePile(pile)
  }

  return {
    piles,
    seed: state.seed,
    variantId: state.variantId,
    options: { ...state.options },
    score: state.score,
    moveCount: state.moveCount,
    recycleCount: state.recycleCount,
    won: state.won,
  }
}

export const KLONDIKE_PILE_IDS = {
  foundations: ['foundation-0', 'foundation-1', 'foundation-2', 'foundation-3'],
  tableaus: ['tableau-0', 'tableau-1', 'tableau-2', 'tableau-3', 'tableau-4', 'tableau-5', 'tableau-6'],
  stock: 'stock',
  waste: 'waste',
} as const

export function createEmptyKlondikePiles(): Record<string, Pile> {
  const piles: Record<string, Pile> = {}

  for (const id of KLONDIKE_PILE_IDS.foundations) {
    piles[id] = { id, cards: [] }
  }
  for (const id of KLONDIKE_PILE_IDS.tableaus) {
    piles[id] = { id, cards: [] }
  }
  piles[KLONDIKE_PILE_IDS.stock] = { id: KLONDIKE_PILE_IDS.stock, cards: [] }
  piles[KLONDIKE_PILE_IDS.waste] = { id: KLONDIKE_PILE_IDS.waste, cards: [] }

  return piles
}
