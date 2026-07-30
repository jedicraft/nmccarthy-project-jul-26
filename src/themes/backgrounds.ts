export type BackgroundId =
  | 'felt'
  | 'tropical'
  | 'waterfall'
  | 'city'
  | 'mountains'

export interface BackgroundDefinition {
  id: BackgroundId
  label: string
  image: string | null
}

export const BACKGROUNDS: BackgroundDefinition[] = [
  { id: 'felt', label: 'Classic Felt', image: null },
  {
    id: 'tropical',
    label: 'Tropical',
    image: '/assets/backgrounds/tropical.jpg',
  },
  {
    id: 'waterfall',
    label: 'Waterfall',
    image: '/assets/backgrounds/waterfall.jpg',
  },
  { id: 'city', label: 'City', image: '/assets/backgrounds/city.jpg' },
  {
    id: 'mountains',
    label: 'Mountains',
    image: '/assets/backgrounds/mountains.jpg',
  },
]

const VALID_IDS = new Set<BackgroundId>(
  BACKGROUNDS.map((background) => background.id),
)

export function isBackgroundId(value: string): value is BackgroundId {
  return VALID_IDS.has(value as BackgroundId)
}

export function applyBackground(backgroundId: BackgroundId): void {
  document.documentElement.dataset.background = backgroundId
}
