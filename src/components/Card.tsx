import type { Rank, Suit } from '../game/core/types.ts'
import { isRedSuit } from '../game/core/types.ts'

const RANK_LABELS: Record<Rank, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export interface CardProps {
  suit: Suit
  rank: Rank
  compact?: boolean
  className?: string
}

export function Card({ suit, rank, compact = false, className = '' }: CardProps) {
  const colorClass = isRedSuit(suit) ? 'card--red' : 'card--black'
  const label = RANK_LABELS[rank]
  const symbol = SUIT_SYMBOLS[suit]

  return (
    <div
      className={`card card--face ${colorClass} ${compact ? 'card--compact' : ''} ${className}`.trim()}
      aria-label={`${label} of ${suit}`}
    >
      <span className="card__corner card__corner--tl">{label}</span>
      <span className="card__corner card__corner--tl-suit">{symbol}</span>
      <span className="card__center">{symbol}</span>
      <span className="card__corner card__corner--br">{label}</span>
      <span className="card__corner card__corner--br-suit">{symbol}</span>
    </div>
  )
}

export { RANK_LABELS, SUIT_SYMBOLS }
