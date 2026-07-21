import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Card as CardType, Pile } from '../game/core/types.ts'
import { Card } from './Card.tsx'
import { CardBack } from './CardBack.tsx'

export interface PileViewProps {
  pile: Pile
  pileType: 'stock' | 'waste' | 'foundation' | 'tableau'
  showLogoBack: boolean
  drawCount: 1 | 3
  onStockClick?: () => void
  onCardDoubleClick?: (pileId: string, cardIndex: number) => void
}

function DraggableCard({
  card,
  pileId,
  cardIndex,
  offsetY,
  showLogoBack,
  onDoubleClick,
}: {
  card: CardType
  pileId: string
  cardIndex: number
  offsetY: number
  showLogoBack: boolean
  onDoubleClick?: (pileId: string, cardIndex: number) => void
}) {
  const dragId = `card:${pileId}:${cardIndex}`
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId,
      data: { pileId, cardIndex },
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    top: offsetY,
    zIndex: isDragging ? 50 : cardIndex + 1,
    opacity: isDragging ? 0.85 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className="pile__card-wrapper"
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onDoubleClick?.(pileId, cardIndex)}
    >
      {card.faceUp ? (
        <Card suit={card.suit} rank={card.rank} />
      ) : (
        <CardBack showLogo={showLogoBack} />
      )}
    </div>
  )
}

export function PileView({
  pile,
  pileType,
  showLogoBack,
  drawCount,
  onStockClick,
  onCardDoubleClick,
}: PileViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `pile:${pile.id}`,
    data: { pileId: pile.id },
  })

  const isEmpty = pile.cards.length === 0
  const slotLabel =
    pileType === 'foundation'
      ? 'Foundation'
      : pileType === 'tableau'
        ? 'Tableau'
        : undefined

  if (pileType === 'stock') {
    return (
      <div
        ref={setNodeRef}
        className={`pile pile--stock ${isOver ? 'pile--over' : ''}`}
      >
        <button
          type="button"
          className="pile__slot pile__slot--interactive"
          onClick={onStockClick}
          aria-label={
            pile.cards.length > 0 ? 'Draw from stock' : 'Recycle waste to stock'
          }
        >
          {pile.cards.length > 0 ? (
            <CardBack showLogo={showLogoBack} />
          ) : (
            <span className="pile__slot-label">↻</span>
          )}
          {pile.cards.length > 1 ? (
            <span className="pile__count">{pile.cards.length}</span>
          ) : null}
        </button>
      </div>
    )
  }

  if (pileType === 'waste') {
    const visibleCount = Math.min(drawCount, pile.cards.length)
    const startIndex = Math.max(0, pile.cards.length - visibleCount)

    return (
      <div
        ref={setNodeRef}
        className={`pile pile--waste ${isOver ? 'pile--over' : ''}`}
      >
        <div className="pile__slot">
          {isEmpty ? <span className="pile__slot-label">Waste</span> : null}
          {pile.cards.slice(startIndex).map((card, index) => {
            const cardIndex = startIndex + index
            const isTop = cardIndex === pile.cards.length - 1
            return (
              <div
                key={card.id}
                className="pile__card-wrapper"
                style={{
                  left: index * 18,
                  zIndex: cardIndex + 1,
                }}
              >
                {isTop ? (
                  <DraggableCard
                    card={card}
                    pileId={pile.id}
                    cardIndex={cardIndex}
                    offsetY={0}
                    showLogoBack={showLogoBack}
                    onDoubleClick={onCardDoubleClick}
                  />
                ) : (
                  <Card suit={card.suit} rank={card.rank} compact />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (pileType === 'foundation') {
    const top = pile.cards.at(-1)
    return (
      <div
        ref={setNodeRef}
        className={`pile pile--foundation ${isOver ? 'pile--over' : ''}`}
      >
        <div className="pile__slot">
          {top ? (
            <DraggableCard
              card={top}
              pileId={pile.id}
              cardIndex={pile.cards.length - 1}
              offsetY={0}
              showLogoBack={showLogoBack}
              onDoubleClick={onCardDoubleClick}
            />
          ) : (
            <span className="pile__slot-label">{slotLabel}</span>
          )}
        </div>
      </div>
    )
  }

  const firstFaceUp = pile.cards.findIndex((card) => card.faceUp)

  return (
    <div
      ref={setNodeRef}
      className={`pile pile--tableau ${isOver ? 'pile--over' : ''}`}
    >
      <div className="pile__slot pile__slot--tableau">
        {isEmpty ? <span className="pile__slot-label">{slotLabel}</span> : null}
        {pile.cards.map((card, cardIndex) => {
          const offsetY = cardIndex * 22
          const canDrag = card.faceUp && cardIndex >= firstFaceUp

          if (canDrag) {
            return (
              <DraggableCard
                key={card.id}
                card={card}
                pileId={pile.id}
                cardIndex={cardIndex}
                offsetY={offsetY}
                showLogoBack={showLogoBack}
                onDoubleClick={onCardDoubleClick}
              />
            )
          }

          return (
            <div
              key={card.id}
              className="pile__card-wrapper"
              style={{ top: offsetY, zIndex: cardIndex + 1 }}
            >
              <CardBack showLogo={showLogoBack} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
