export interface CardBackProps {
  showLogo?: boolean
  className?: string
}

export function CardBack({ showLogo = true, className = '' }: CardBackProps) {
  return (
    <div className={`card card--back ${className}`.trim()} aria-hidden="true">
      <div className="card-back__pattern" />
      {showLogo ? (
        <img
          src="/assets/cards/logo.svg"
          alt=""
          className="card-back__logo"
          draggable={false}
        />
      ) : null}
    </div>
  )
}
