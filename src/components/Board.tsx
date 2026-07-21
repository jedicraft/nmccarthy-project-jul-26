import { useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { Card as CardType } from '../game/core/types.ts'
import { KLONDIKE_PILE_IDS } from '../game/core/types.ts'
import type { UseGameEngineResult } from '../hooks/useGameEngine.ts'
import { Card } from './Card.tsx'
import { CardBack } from './CardBack.tsx'
import { PileView } from './PileView.tsx'

export interface BoardProps {
  engine: UseGameEngineResult
  drawCount: 1 | 3
  showLogoBack: boolean
  onMove?: () => void
  onFlip?: () => void
  onDraw?: () => void
  onRecycle?: () => void
}

interface ActiveDrag {
  pileId: string
  cardIndex: number
  cards: CardType[]
}

function parseDragId(id: string): { pileId: string; cardIndex: number } | null {
  if (!id.startsWith('card:')) {
    return null
  }
  const [, pileId, indexText] = id.split(':')
  if (!pileId || indexText === undefined) {
    return null
  }
  return { pileId, cardIndex: Number(indexText) }
}

function parseDropId(id: string): string | null {
  if (!id.startsWith('pile:')) {
    return null
  }
  return id.slice(5)
}

export function Board({
  engine,
  drawCount,
  showLogoBack,
  onMove,
  onFlip,
  onDraw,
  onRecycle,
}: BoardProps) {
  const { state } = engine
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const handleStockClick = useCallback(() => {
    const stock = state.piles[KLONDIKE_PILE_IDS.stock]!
    if (stock.cards.length > 0) {
      if (engine.drawFromStock()) {
        onDraw?.()
      }
      return
    }

    if (engine.recycleStock()) {
      onRecycle?.()
    }
  }, [engine, onDraw, onRecycle, state.piles])

  const handleCardDoubleClick = useCallback(
    (pileId: string, cardIndex: number) => {
      const pile = state.piles[pileId]
      if (!pile || pile.cards[cardIndex]?.faceUp !== true) {
        return
      }

      if (engine.autoMoveToFoundation(pileId)) {
        onMove?.()
        return
      }

      if (cardIndex === pile.cards.length - 1) {
        onFlip?.()
      }
    },
    [engine, onFlip, onMove, state.piles],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const parsed = parseDragId(String(event.active.id))
      if (!parsed) {
        return
      }

      const pile = state.piles[parsed.pileId]
      if (!pile) {
        return
      }

      setActiveDrag({
        pileId: parsed.pileId,
        cardIndex: parsed.cardIndex,
        cards: pile.cards.slice(parsed.cardIndex),
      })
    },
    [state.piles],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)

      const parsed = parseDragId(String(event.active.id))
      if (!parsed || !event.over) {
        return
      }

      const toPileId = parseDropId(String(event.over.id))
      if (!toPileId || toPileId === parsed.pileId) {
        return
      }

      if (engine.moveToPile(parsed.pileId, toPileId, parsed.cardIndex)) {
        onMove?.()
      }
    },
    [engine, onMove],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="board">
        <div className="board__top">
          <div className="board__stock-waste">
            <PileView
              pile={state.piles[KLONDIKE_PILE_IDS.stock]!}
              pileType="stock"
              showLogoBack={showLogoBack}
              drawCount={drawCount}
              onStockClick={handleStockClick}
            />
            <PileView
              pile={state.piles[KLONDIKE_PILE_IDS.waste]!}
              pileType="waste"
              showLogoBack={showLogoBack}
              drawCount={drawCount}
              onCardDoubleClick={handleCardDoubleClick}
            />
          </div>
          <div className="board__foundations">
            {KLONDIKE_PILE_IDS.foundations.map((foundationId) => (
              <PileView
                key={foundationId}
                pile={state.piles[foundationId]!}
                pileType="foundation"
                showLogoBack={showLogoBack}
                drawCount={drawCount}
                onCardDoubleClick={handleCardDoubleClick}
              />
            ))}
          </div>
        </div>

        <div className="board__tableaus">
          {KLONDIKE_PILE_IDS.tableaus.map((tableauId) => (
            <PileView
              key={tableauId}
              pile={state.piles[tableauId]!}
              pileType="tableau"
              showLogoBack={showLogoBack}
              drawCount={drawCount}
              onCardDoubleClick={handleCardDoubleClick}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="drag-overlay">
            {activeDrag.cards.map((card, index) => (
              <div
                key={card.id}
                className="drag-overlay__card"
                style={{ top: index * 22 }}
              >
                {card.faceUp ? (
                  <Card suit={card.suit} rank={card.rank} />
                ) : (
                  <CardBack showLogo={showLogoBack} />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
