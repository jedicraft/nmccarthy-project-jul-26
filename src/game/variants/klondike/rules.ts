import { shuffle } from '../../core/rng.ts'
import type { Card, GameState, KlondikeOptions, Move, Pile, Rank, Suit } from '../../core/types.ts'
import {
  KLONDIKE_PILE_IDS,
  cloneState,
  createDeck,
  createEmptyKlondikePiles,
  oppositeColor,
} from '../../core/types.ts'
import { scoreMove } from './scoring.ts'

function getPile(state: GameState, pileId: string): Pile {
  const pile = state.piles[pileId]
  if (!pile) {
    throw new Error(`Unknown pile: ${pileId}`)
  }
  return pile
}

function topCard(pile: Pile): Card | undefined {
  return pile.cards.at(-1)
}

function faceUpCards(pile: Pile): Card[] {
  const start = pile.cards.findIndex((card) => card.faceUp)
  if (start === -1) {
    return []
  }
  return pile.cards.slice(start)
}

function canPlaceOnFoundation(card: Card, foundation: Pile): boolean {
  const top = topCard(foundation)
  if (!top) {
    return card.rank === 1
  }
  return card.suit === top.suit && card.rank === top.rank + 1
}

function canPlaceOnTableau(card: Card, tableau: Pile): boolean {
  const top = topCard(tableau)
  if (!top) {
    return card.rank === 13
  }
  if (!top.faceUp) {
    return false
  }
  return oppositeColor(card.suit, top.suit) && card.rank === top.rank - 1
}

function isValidTableauRun(cards: Card[]): boolean {
  if (cards.length === 0 || !cards.every((card) => card.faceUp)) {
    return false
  }

  for (let i = 1; i < cards.length; i += 1) {
    const prev = cards[i - 1]!
    const curr = cards[i]!
    if (!oppositeColor(prev.suit, curr.suit) || prev.rank !== curr.rank + 1) {
      return false
    }
  }

  return true
}

function findFoundationForCard(state: GameState, card: Card): string | null {
  for (const foundationId of KLONDIKE_PILE_IDS.foundations) {
    const foundation = getPile(state, foundationId)
    if (canPlaceOnFoundation(card, foundation)) {
      return foundationId
    }
  }
  return null
}

function canRecycle(state: GameState): boolean {
  const stock = getPile(state, KLONDIKE_PILE_IDS.stock)
  const waste = getPile(state, KLONDIKE_PILE_IDS.waste)

  if (stock.cards.length > 0 || waste.cards.length === 0) {
    return false
  }

  return state.options.unlimitedRecycle || state.recycleCount === 0
}

export function dealKlondike(seed: number, options: KlondikeOptions): GameState {
  const piles = createEmptyKlondikePiles()
  const shuffled = shuffle(createDeck(), seed)

  let cursor = 0
  for (let column = 0; column < KLONDIKE_PILE_IDS.tableaus.length; column += 1) {
    const tableauId = KLONDIKE_PILE_IDS.tableaus[column]!
    const tableau = piles[tableauId]!

    for (let row = 0; row <= column; row += 1) {
      const card = shuffled[cursor]!
      cursor += 1
      tableau.cards.push({
        ...card,
        faceUp: row === column,
      })
    }
  }

  const stock = piles[KLONDIKE_PILE_IDS.stock]!
  while (cursor < shuffled.length) {
    stock.cards.push({ ...shuffled[cursor]!, faceUp: false })
    cursor += 1
  }

  return {
    piles,
    seed,
    variantId: 'klondike',
    options: { ...options },
    score: 0,
    moveCount: 0,
    recycleCount: 0,
    won: false,
  }
}

export function getLegalMoves(state: GameState): Move[] {
  if (state.won) {
    return []
  }

  const moves: Move[] = []
  const seen = new Set<string>()

  const addMove = (move: Move) => {
    const key = JSON.stringify(move)
    if (!seen.has(key)) {
      seen.add(key)
      moves.push(move)
    }
  }

  const stock = getPile(state, KLONDIKE_PILE_IDS.stock)
  const waste = getPile(state, KLONDIKE_PILE_IDS.waste)

  if (stock.cards.length > 0) {
    addMove({ type: 'draw' })
  } else if (canRecycle(state)) {
    addMove({ type: 'recycle' })
  }

  const wasteTop = topCard(waste)
  if (wasteTop?.faceUp) {
    const foundationId = findFoundationForCard(state, wasteTop)
    if (foundationId) {
      addMove({
        type: 'move',
        from: KLONDIKE_PILE_IDS.waste,
        to: foundationId,
        count: 1,
      })
    }

    for (const tableauId of KLONDIKE_PILE_IDS.tableaus) {
      const tableau = getPile(state, tableauId)
      if (canPlaceOnTableau(wasteTop, tableau)) {
        addMove({
          type: 'move',
          from: KLONDIKE_PILE_IDS.waste,
          to: tableauId,
          count: 1,
        })
      }
    }
  }

  for (const tableauId of KLONDIKE_PILE_IDS.tableaus) {
    const tableau = getPile(state, tableauId)
    const run = faceUpCards(tableau)
    if (run.length === 0) {
      continue
    }

    for (let offset = 0; offset < run.length; offset += 1) {
      const moving = run.slice(offset)
      if (!isValidTableauRun(moving)) {
        break
      }

      const movingTop = moving[0]!

      for (const foundationId of KLONDIKE_PILE_IDS.foundations) {
        if (offset === 0 && canPlaceOnFoundation(movingTop, getPile(state, foundationId))) {
          addMove({
            type: 'move',
            from: tableauId,
            to: foundationId,
            count: moving.length,
          })
        }
      }

      for (const targetId of KLONDIKE_PILE_IDS.tableaus) {
        if (targetId === tableauId) {
          continue
        }

        const target = getPile(state, targetId)
        if (canPlaceOnTableau(movingTop, target)) {
          addMove({
            type: 'move',
            from: tableauId,
            to: targetId,
            count: moving.length,
          })
        }
      }
    }
  }

  return moves
}

function flipRevealedCard(state: GameState, pileId: string): Move | null {
  const pile = getPile(state, pileId)
  if (pile.cards.length === 0) {
    return null
  }

  const topIndex = pile.cards.length - 1
  const top = pile.cards[topIndex]
  if (!top || top.faceUp) {
    return null
  }

  return {
    type: 'flip',
    pileId,
    cardIndex: topIndex,
  }
}

export function applyMove(state: GameState, move: Move): GameState | null {
  if (state.won) {
    return null
  }

  const legalMoves = getLegalMoves(state)
  const isLegal = legalMoves.some((candidate) =>
    candidate.type === move.type &&
    candidate.from === move.from &&
    candidate.to === move.to &&
    candidate.count === move.count &&
    candidate.pileId === move.pileId &&
    candidate.cardIndex === move.cardIndex,
  )

  if (!isLegal) {
    return null
  }

  const next = cloneState(state)
  next.moveCount += 1

  if (move.type === 'draw') {
    const stock = getPile(next, KLONDIKE_PILE_IDS.stock)
    const waste = getPile(next, KLONDIKE_PILE_IDS.waste)
    const drawCount = Math.min(next.options.drawCount, stock.cards.length)

    for (let i = 0; i < drawCount; i += 1) {
      const card = stock.cards.pop()
      if (!card) {
        break
      }
      waste.cards.push({ ...card, faceUp: true })
    }

    next.score += scoreMove(state, move, next)
    next.won = isWin(next)
    return next
  }

  if (move.type === 'recycle') {
    const stock = getPile(next, KLONDIKE_PILE_IDS.stock)
    const waste = getPile(next, KLONDIKE_PILE_IDS.waste)

    while (waste.cards.length > 0) {
      const card = waste.cards.pop()
      if (!card) {
        break
      }
      stock.cards.unshift({ ...card, faceUp: false })
    }

    next.recycleCount += 1
    next.score += scoreMove(state, move, next)
    next.won = isWin(next)
    return next
  }

  if (move.type === 'move') {
    const fromPile = getPile(next, move.from!)
    const toPile = getPile(next, move.to!)
    const count = move.count ?? 1

    if (fromPile.cards.length < count) {
      return null
    }

    const moving = fromPile.cards.splice(fromPile.cards.length - count, count)
    if (!moving.every((card) => card.faceUp)) {
      return null
    }

    if (move.from!.startsWith('tableau-') && !isValidTableauRun(moving)) {
      return null
    }

    if (move.to!.startsWith('foundation-')) {
      if (moving.length !== 1 || !canPlaceOnFoundation(moving[0]!, toPile)) {
        return null
      }
    } else if (move.to!.startsWith('tableau-')) {
      if (!canPlaceOnTableau(moving[0]!, toPile)) {
        return null
      }
    } else {
      return null
    }

    toPile.cards.push(...moving)

    const flip = flipRevealedCard(next, move.from!)
    if (flip) {
      const pile = getPile(next, flip.pileId!)
      const card = pile.cards[flip.cardIndex!]
      if (card) {
        card.faceUp = true
      }
    }

    next.score += scoreMove(state, move, next)
    next.won = isWin(next)
    return next
  }

  return null
}

export function isWin(state: GameState): boolean {
  let foundationCards = 0
  for (const foundationId of KLONDIKE_PILE_IDS.foundations) {
    foundationCards += getPile(state, foundationId).cards.length
  }
  return foundationCards === 52
}

export function createRankRun(start: Rank, length: number, suit: Suit, faceUp = true): Card[] {
  const cards: Card[] = []
  for (let i = 0; i < length; i += 1) {
    const rank = (start - i) as Rank
    cards.push({
      id: `${suit}-${rank}`,
      suit,
      rank,
      faceUp,
    })
  }
  return cards
}

export function createTestState(partial: Partial<GameState> & Pick<GameState, 'piles'>): GameState {
  return {
    seed: partial.seed ?? 1,
    variantId: partial.variantId ?? 'klondike',
    options: partial.options ?? { drawCount: 1, unlimitedRecycle: true },
    score: partial.score ?? 0,
    moveCount: partial.moveCount ?? 0,
    recycleCount: partial.recycleCount ?? 0,
    won: partial.won ?? false,
    piles: partial.piles,
  }
}
