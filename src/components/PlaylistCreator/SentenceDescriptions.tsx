/* eslint-disable @typescript-eslint/camelcase */
import React from 'react'
import { SelectOptions } from '.'

export const createTargetDescription = (
  state: SpotifyApi.RecommendationsOptionsObject
) => {
  const entries = Object.entries(state)
  const filteredEntries = entries.filter((i) =>
    [
      'target_acousticness',
      'target_danceability',
      'target_energy',
      'target_valence',
      'target_tempo',
      'target_liveness',
      'target_popularity',
    ].includes(i[0])
  )
  const constructPhrase: {
    [key: string]: (value: number) => React.ReactNode
  } = {
    target_acousticness: (value: number) => {
      if (value < 0.2) {
        return (
          <span>
            have <strong>mostly electronic</strong> elements
          </span>
        )
      }
      if (value < 0.5) {
        return (
          <span>
            include <strong>some acoustic</strong> instruments
          </span>
        )
      } else {
        return (
          <span>
            have <strong>mostly acoustic</strong> sounds
          </span>
        )
      }
    },
    target_danceability: (value: number) => {
      if (value < 0.4) {
        return (
          <span>
            are <strong>not danceable</strong>
          </span>
        )
      }
      if (value < 0.6) {
        return (
          <span>
            are <strong>not very danceable</strong>
          </span>
        )
      }
      if (value < 0.8) {
        return (
          <span>
            are <strong>pretty danceable</strong>
          </span>
        )
      } else {
        return (
          <span>
            are <strong>super danceable</strong>
          </span>
        )
      }
    },
    target_energy: (value: number) => {
      if (value < 0.3) {
        return (
          <span>
            are <strong>very sleepy</strong>
          </span>
        )
      }
      if (value < 0.5) {
        return (
          <span>
            with <strong>not much energy</strong>
          </span>
        )
      }
      if (value < 0.8) {
        return (
          <span>
            are <strong>reasonably energetic</strong>
          </span>
        )
      } else {
        return (
          <span>
            are <strong>epic party vibes</strong>
          </span>
        )
      }
    },
    target_valence: (value: number) => {
      if (value < 0.3) {
        return (
          <span>
            will <strong>make me cry</strong>
          </span>
        )
      }
      if (value < 0.5) {
        return (
          <span>
            are <strong>pretty sad</strong>
          </span>
        )
      }
      if (value < 0.7) {
        return (
          <span>
            sound <strong>happy</strong>
          </span>
        )
      } else {
        return (
          <span>
            sound <strong>very happy</strong>
          </span>
        )
      }
    },
    target_tempo: (value: number) => {
      if (value < 0.3) {
        return (
          <span>
            have a <strong>slow tempo</strong>
          </span>
        )
      }
      if (value < 6) {
        return (
          <span>
            have a <strong>moderate tempo</strong>
          </span>
        )
      } else {
        return (
          <span>
            have a <strong>fast tempo</strong>
          </span>
        )
      }
    },
    target_liveness: (value: number) => {
      if (value < 0.1) {
        return (
          <span>
            were <strong>recorded in a studio</strong>
          </span>
        )
      }
      if (value < 0.4) {
        return (
          <span>
            include some <strong>live performances</strong>
          </span>
        )
      } else {
        return (
          <span>
            are as <strong>live and raw</strong> as it gets
          </span>
        )
      }
    },
    target_popularity: (value: number) => {
      if (value < 0.3) {
        return (
          <span>
            are by <strong>unearthed</strong> artists
          </span>
        )
      }
      if (value < 0.7) {
        return (
          <span>
            are by <strong>up and coming</strong> artists
          </span>
        )
      } else {
        return (
          <span>
            are by the <strong>most popular</strong> artists
          </span>
        )
      }
    },
  }
  const phrases = filteredEntries.map(([key, value]) =>
    constructPhrase[key](value)
  )
  if (!phrases.length) {
    return null
  }
  if (phrases.length === 1) {
    return <div>Make me a playlist with songs that {phrases[0]}.</div>
  } else {
    return (
      <div>
        Make me a playlist with songs that
        {phrases.slice(0, phrases.length - 1).map((phrase, i) => (
          <span key={`phrase-${i}`}> {phrase},</span>
        ))}{' '}
        and {phrases[phrases.length - 1]}.
      </div>
    )
  }
}

const formatArtistsAsSentence = (
  artists: SpotifyApi.ArtistObjectSimplified[]
) => {
  if (artists.length === 1) {
    return <strong>{artists[0].name}</strong>
  }
  if (artists.length === 2) {
    return (
      <span>
        <strong>{artists[0].name}</strong> and{' '}
        <strong>{artists[1].name}</strong>{' '}
      </span>
    )
  } else {
    return (
      <span>
        <strong>{artists[0].name}</strong>
        {artists.slice(1, artists.length - 1).map((a, id) => (
          <span key={id}>
            , <strong>{a.name}</strong>
          </span>
        ))}{' '}
        and <strong>{artists[artists.length - 1].name}</strong>
      </span>
    )
  }
}

export const getStringForTrackOrArtist = (selection: SelectOptions) => {
  if (selection.data?.type === 'track') {
    const data = selection.data.data as SpotifyApi.TrackObjectFull
    return (
      <span>
        <strong>{data.name}</strong> by {formatArtistsAsSentence(data.artists)}
      </span>
    )
  }
  if (selection.data?.type === 'artist') {
    const data = selection.data.data as SpotifyApi.ArtistObjectFull
    return (
      <span>
        <strong>{data.name}</strong>
      </span>
    )
  }
}

export const createSelectionDescription = (selections: SelectOptions[]) => {
  if (!selections.length) {
    return (
      <span>
        Pick some seeds to get started{' '}
        <span role="img" aria-label="hands">
          👏
        </span>
        .
      </span>
    )
  }
  if (selections.length === 1) {
    return (
      <span>
        Using {getStringForTrackOrArtist(selections[0])} as inspiration.
      </span>
    )
  }
  if (selections.length === 2) {
    return (
      <span>
        Using {getStringForTrackOrArtist(selections[0])} and{' '}
        {getStringForTrackOrArtist(selections[1])} as inspiration.
      </span>
    )
  } else {
    return (
      <span>
        Using{' '}
        {selections.slice(0, selections.length - 1).map((s, id) => (
          <span key={id}>{getStringForTrackOrArtist(s)}, </span>
        ))}
        and {getStringForTrackOrArtist(selections[selections.length - 1])} as
        inspiration.
      </span>
    )
  }
}
