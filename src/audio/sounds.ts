import { Howl } from 'howler'

type SoundName = 'move' | 'flip' | 'draw' | 'recycle' | 'win' | 'undo'

const soundPaths: Record<SoundName, string> = {
  move: '/audio/move.mp3',
  flip: '/audio/flip.mp3',
  draw: '/audio/draw.mp3',
  recycle: '/audio/recycle.mp3',
  win: '/audio/win.mp3',
  undo: '/audio/undo.mp3',
}

const sounds: Partial<Record<SoundName, Howl>> = {}
let enabled = true

function getSound(name: SoundName): Howl | null {
  if (!enabled) {
    return null
  }

  if (!sounds[name]) {
    try {
      sounds[name] = new Howl({
        src: [soundPaths[name]],
        volume: 0.5,
        preload: false,
        onloaderror: () => {
          delete sounds[name]
        },
      })
    } catch {
      return null
    }
  }

  return sounds[name] ?? null
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
}

export function playSound(name: SoundName): void {
  const sound = getSound(name)
  if (!sound) {
    return
  }

  try {
    if (sound.state() === 'unloaded') {
      sound.once('load', () => {
        sound.play()
      })
      sound.load()
    } else {
      sound.play()
    }
  } catch {
    // Silent fallback when audio files are missing
  }
}
