export interface Rng {
  next: () => number
  nextInt: (maxExclusive: number) => number
}

function hashSeed(seed: number): number {
  let h = seed >>> 0
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^ (h >>> 16)) >>> 0
}

export function createRng(seed: number): Rng {
  let state = hashSeed(seed) || 1

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const nextInt = (maxExclusive: number): number => {
    if (maxExclusive <= 0) {
      return 0
    }
    return Math.floor(next() * maxExclusive)
  }

  return { next, nextInt }
}

export function shuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  const rng = createRng(seed)

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = rng.nextInt(i + 1)
    const temp = result[i]
    result[i] = result[j]!
    result[j] = temp!
  }

  return result
}
