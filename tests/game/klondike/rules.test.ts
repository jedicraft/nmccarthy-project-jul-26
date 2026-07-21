import { describe, expect, it } from 'vitest'
import { KLONDIKE_PILE_IDS } from '../../../src/game/core/types.ts'
import {
  applyMove,
  createRankRun,
  createTestState,
  dealKlondike,
  getLegalMoves,
  isWin,
} from '../../../src/game/variants/klondike/rules.ts'

describe('Klondike rules', () => {
  describe('initial deal', () => {
    it('deals 28 cards to tableau piles with ascending counts', () => {
      const state = dealKlondike(42, { drawCount: 1, unlimitedRecycle: true })

      let tableauCards = 0
      KLONDIKE_PILE_IDS.tableaus.forEach((tableauId, index) => {
        const pile = state.piles[tableauId]!
        expect(pile.cards).toHaveLength(index + 1)
        tableauCards += pile.cards.length
        expect(pile.cards.at(-1)?.faceUp).toBe(true)
        pile.cards.slice(0, -1).forEach((card) => {
          expect(card.faceUp).toBe(false)
        })
      })

      expect(tableauCards).toBe(28)
    })

    it('places remaining cards face-down in stock', () => {
      const state = dealKlondike(42, { drawCount: 1, unlimitedRecycle: true })
      const stock = state.piles[KLONDIKE_PILE_IDS.stock]!

      expect(stock.cards).toHaveLength(24)
      stock.cards.forEach((card) => {
        expect(card.faceUp).toBe(false)
      })
      expect(state.piles[KLONDIKE_PILE_IDS.waste]!.cards).toHaveLength(0)
    })

    it('produces reproducible deals for the same seed', () => {
      const options = { drawCount: 1 as const, unlimitedRecycle: true }
      const first = dealKlondike(99, options)
      const second = dealKlondike(99, options)

      KLONDIKE_PILE_IDS.tableaus.forEach((tableauId) => {
        const a = first.piles[tableauId]!.cards.map((card) => card.id)
        const b = second.piles[tableauId]!.cards.map((card) => card.id)
        expect(a).toEqual(b)
      })
    })
  })

  describe('legal foundation move', () => {
    it('allows moving an ace to an empty foundation', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'hearts-1', suit: 'hearts', rank: 1, faceUp: true }],
          },
        },
      })

      const moves = getLegalMoves(state)
      expect(moves).toContainEqual({
        type: 'move',
        from: 'tableau-0',
        to: 'foundation-0',
        count: 1,
      })

      const next = applyMove(state, {
        type: 'move',
        from: 'tableau-0',
        to: 'foundation-0',
        count: 1,
      })

      expect(next?.piles['foundation-0']!.cards).toHaveLength(1)
      expect(next?.piles['tableau-0']!.cards).toHaveLength(0)
    })

    it('allows building foundations in ascending same-suit order', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'foundation-0': {
            id: 'foundation-0',
            cards: [{ id: 'hearts-1', suit: 'hearts', rank: 1, faceUp: true }],
          },
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'hearts-2', suit: 'hearts', rank: 2, faceUp: true }],
          },
        },
      })

      const next = applyMove(state, {
        type: 'move',
        from: 'tableau-0',
        to: 'foundation-0',
        count: 1,
      })

      expect(next?.piles['foundation-0']!.cards.map((card) => card.rank)).toEqual([1, 2])
    })
  })

  describe('tableau build rules', () => {
    it('allows alternating-color descending builds', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'clubs-8', suit: 'clubs', rank: 8, faceUp: true }],
          },
          'tableau-1': {
            id: 'tableau-1',
            cards: [{ id: 'hearts-7', suit: 'hearts', rank: 7, faceUp: true }],
          },
        },
      })

      const next = applyMove(state, {
        type: 'move',
        from: 'tableau-1',
        to: 'tableau-0',
        count: 1,
      })

      expect(next?.piles['tableau-0']!.cards.map((card) => card.id)).toEqual(['clubs-8', 'hearts-7'])
    })

    it('rejects same-color tableau builds', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'hearts-7', suit: 'hearts', rank: 7, faceUp: true }],
          },
          'tableau-1': {
            id: 'tableau-1',
            cards: [{ id: 'diamonds-8', suit: 'diamonds', rank: 8, faceUp: true }],
          },
        },
      })

      expect(
        applyMove(state, {
          type: 'move',
          from: 'tableau-1',
          to: 'tableau-0',
          count: 1,
        }),
      ).toBeNull()
    })

    it('allows kings on empty tableau columns', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'spades-13', suit: 'spades', rank: 13, faceUp: true }],
          },
        },
      })

      const next = applyMove(state, {
        type: 'move',
        from: 'tableau-0',
        to: 'tableau-3',
        count: 1,
      })

      expect(next?.piles['tableau-3']!.cards).toHaveLength(1)
    })

    it('allows moving valid face-up runs together', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'tableau-0': {
            id: 'tableau-0',
            cards: [
              { id: 'clubs-9', suit: 'clubs', rank: 9, faceUp: false },
              { id: 'hearts-8', suit: 'hearts', rank: 8, faceUp: true },
              { id: 'clubs-7', suit: 'clubs', rank: 7, faceUp: true },
            ],
          },
          'tableau-1': {
            id: 'tableau-1',
            cards: [{ id: 'spades-9', suit: 'spades', rank: 9, faceUp: true }],
          },
        },
      })

      const next = applyMove(state, {
        type: 'move',
        from: 'tableau-0',
        to: 'tableau-1',
        count: 2,
      })

      expect(next?.piles['tableau-1']!.cards.map((card) => card.rank)).toEqual([9, 8, 7])
      expect(next?.piles['tableau-0']!.cards.at(-1)?.faceUp).toBe(true)
    })
  })

  describe('win detection', () => {
    it('detects a win when all cards are on foundations', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'foundation-0': { id: 'foundation-0', cards: createFullSuit('hearts') },
          'foundation-1': { id: 'foundation-1', cards: createFullSuit('diamonds') },
          'foundation-2': { id: 'foundation-2', cards: createFullSuit('clubs') },
          'foundation-3': { id: 'foundation-3', cards: createFullSuit('spades') },
        },
      })

      expect(isWin(state)).toBe(true)
    })

    it('does not report a win before all cards are cleared', () => {
      const state = createTestState({
        piles: {
          ...emptyKlondikePiles(),
          'foundation-0': { id: 'foundation-0', cards: createFullSuit('hearts') },
          'tableau-0': {
            id: 'tableau-0',
            cards: [{ id: 'spades-13', suit: 'spades', rank: 13, faceUp: true }],
          },
        },
      })

      expect(isWin(state)).toBe(false)
    })
  })

  describe('draw-3', () => {
    it('draws three cards from stock to waste when drawCount is 3', () => {
      const state = createTestState({
        options: { drawCount: 3, unlimitedRecycle: true },
        piles: {
          ...emptyKlondikePiles(),
          stock: {
            id: 'stock',
            cards: Array.from({ length: 10 }, (_, index) => ({
              id: `stock-${index}`,
              suit: 'clubs' as const,
              rank: ((index % 13) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
              faceUp: false,
            })),
          },
        },
      })

      const next = applyMove(state, { type: 'draw' })
      expect(next?.piles.stock.cards).toHaveLength(7)
      expect(next?.piles.waste.cards).toHaveLength(3)
      next?.piles.waste.cards.forEach((card) => {
        expect(card.faceUp).toBe(true)
      })
    })

    it('draws remaining cards when stock has fewer than drawCount', () => {
      const state = createTestState({
        options: { drawCount: 3, unlimitedRecycle: true },
        piles: {
          ...emptyKlondikePiles(),
          stock: {
            id: 'stock',
            cards: [
              { id: 'a', suit: 'hearts', rank: 1, faceUp: false },
              { id: 'b', suit: 'hearts', rank: 2, faceUp: false },
            ],
          },
        },
      })

      const next = applyMove(state, { type: 'draw' })
      expect(next?.piles.stock.cards).toHaveLength(0)
      expect(next?.piles.waste.cards).toHaveLength(2)
    })
  })
})

function emptyKlondikePiles() {
  const piles: Record<string, { id: string; cards: never[] }> = {}
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

function createFullSuit(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades') {
  return Array.from({ length: 13 }, (_, index) => ({
    id: `${suit}-${index + 1}`,
    suit,
    rank: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13,
    faceUp: true,
  }))
}
