/* eslint-disable @typescript-eslint/camelcase */
import emoji from 'node-emoji'

export const initialState: SpotifyApi.RecommendationsOptionsObject = {
  market: 'from_token',
  limit: 50,
}

interface OptionsAction {
  type: 'target' | 'include' | 'exclude' | 'clear' | 'artist' | 'track'
  payload?: { character?: string; ids?: string[] }
}

const targetBase: { [s: string]: number } = {
  acousticness: 0.2,
  danceability: 0.6,
  energy: 0.6,
  liveness: 0.3,
  valence: 0.5,
  tempo: 120,
  popularity: 0.6,
}

const targetMap = [
  [['📯', '🎸', '🎻', '🎷', '🎹'], { feature: 'acousticness', increment: 1.3 }],
  [['🔌', '👾', '🖥', '💊', '🤖'], { feature: 'acousticness', increment: 0.6 }],
  [['💃', '🕺', '👯‍♂️'], { feature: 'danceability', increment: 1.3 }],
  [['🥔', '🙅‍♀️'], { feature: 'danceability', increment: 0.8 }],
  [['😴', '🥱', '💤'], { feature: 'energy', increment: 0.7 }],
  [['🏃‍♂️', '🏃‍♀️', '👟', '💨', '💨', '🤪'], { feature: 'energy', increment: 1.3 }],
  [
    ['🥳', '🎉', '🎈', '🍕', '🎊', '🎪', '🥂', '🍺', '🍻'],
    { feature: 'energy', increment: 1.3 },
  ],
  [
    [
      '😉',
      '😀',
      '😂',
      '😋',
      '😊',
      '😃',
      '😁',
      '😹',
      '😄',
      '😺',
      '😅',
      '😆',
      '❤',
      '🥰',
      '❤️',
      '💟',
      '😍',
      '😻',
      '💓',
      '💗',
      '♥️',
      '👨‍❤️‍👨',
      '💕',
      '💙',
      '💝',
      '🖤',
      '🤎',
      '💘',
      '💚',
      '❣️',
      '🤍',
      '👩‍❤️‍👨',
      '👩‍❤️‍👩',
      '🧡',
      '💜',
      '💛',
      '😘',
      '💞',
      '💖',
      '💑',
      '🥰',
    ],
    { feature: 'valence', increment: 1.3 },
  ],
  [
    ['💔', '😔', '😞', '😢', '😩', '😓', '😭', '😿', '🙁'],
    { feature: 'valence', increment: 0.7 },
  ],
  [
    ['😎', '🤡', '🤩', '👻', '🆒', '🤳'],
    { feature: 'popularity', increment: 1.3 },
  ],
  [['🕵️‍♂️', '🕵️‍♀️', '👀', '👁️'], { feature: 'popularity', increment: 0.7 }],
]

const lookUpEmoji = (char: string) => {
  const data = targetMap.reduce(
    (prev, curr) =>
      ((curr[0] as unknown) as string[]).includes(char)
        ? ((curr[1] as unknown) as { feature: string; increment: number })
        : prev,
    null as null | { feature: string; increment: number }
  )
  console.log('lookup', char, data)
  return data
}

export const optionsReducer = (state: any, action: OptionsAction): any => {
  let feature: {
    feature: string
    increment: number
  } | null
  switch (action.type) {
    case 'target':
      feature = lookUpEmoji(action.payload?.character || '')
      if (feature) {
        return {
          ...state,
          [`target_${feature.feature}`]: state[`target_${feature.feature}`]
            ? Math.max(
                0.1,
                Math.min(
                  state[`target_${feature.feature}`] * feature.increment,
                  0.9
                )
              )
            : targetBase[feature.feature] * feature.increment,
        }
      }
      return state
    case 'include':
      feature = lookUpEmoji(action.payload?.character || '')
      if (feature) {
        return {
          ...state,
          [`min_${feature.feature}`]: state[`min_${feature.feature}`]
            ? state[`min_${feature.feature}`] + feature.increment
            : targetBase[feature.feature],
        }
      }
      return state
    case 'exclude':
      feature = lookUpEmoji(action.payload?.character || '')
      if (feature) {
        return {
          ...state,
          [`max_${feature.feature}`]: state[`max_${feature.feature}`]
            ? state[`max_${feature.feature}`] + feature.increment
            : targetBase[feature.feature],
        }
      }
      break
    case 'artist':
      return {
        ...state,
        seed_artists: action.payload?.ids,
      }
    case 'track':
      return {
        ...state,
        seed_tracks: action.payload?.ids,
      }
    case 'clear':
      return {
        ...initialState,
        seed_artists: state.seed_artists || [],
        seed_tracks: state.seed_tracks || [],
      }
    default:
      throw new Error()
  }
}
