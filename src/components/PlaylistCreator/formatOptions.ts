/* eslint-disable @typescript-eslint/camelcase */
import { cloneDeep, get, orderBy, set, uniq } from 'lodash'
import { SelectOptions } from '.'

const extractGenres = (
  selection: SelectOptions[],
  availableGenres: string[]
) => {
  const artists = selection.filter((s) => s.data?.type === 'artist')
  const genreMap: { [genre: string]: number } = {}
  const mainGenreMap: { [genre: string]: number } = {}
  artists.forEach((a) => {
    const data = a.data?.data as SpotifyApi.ArtistObjectFull
    data.genres.forEach((g, i) => {
      set(mainGenreMap, g, get(mainGenreMap, g, 0) + 10 - i)
      if (i) {
        set(genreMap, g, get(genreMap, g, 0) + 10 - i)
      }
    })
  })

  const idealGenreOptions = uniq(
    orderBy(Object.entries(genreMap), [1], ['desc'])
      .map(([g]) => availableGenres.filter((a) => g.includes(a)))
      .flat()
  )

  if (idealGenreOptions.length) {
    return idealGenreOptions
  } else {
    return orderBy(Object.entries(mainGenreMap), [1], ['desc'])
      .filter(([key]) => availableGenres.includes(key))
      .map(([key]) => key)
  }
}

export const formatOptions = (
  options: SpotifyApi.RecommendationsOptionsObject,
  genres: string[],
  selection: SelectOptions[]
) => {
  const newOpts = cloneDeep(options)
  if (newOpts.target_popularity) {
    newOpts.target_popularity = Math.floor(newOpts.target_popularity * 100)
    if (newOpts.target_popularity < 30) {
      newOpts.max_popularity = 50
    }
    if (newOpts.target_popularity > 70) {
      newOpts.min_popularity = 60
    }
  }
  if (newOpts.target_valence) {
    if (newOpts.target_valence < 0.3) {
      newOpts.max_valence = 0.6
    }
    if (newOpts.target_valence > 0.7) {
      newOpts.min_valence = 0.5
    }
  }
  if (newOpts.target_acousticness) {
    if (newOpts.target_acousticness > 0.5) {
      newOpts.min_acousticness = 0.2
    }
  }
  if (newOpts.target_energy) {
    if (newOpts.target_energy < 0.3) {
      newOpts.max_energy = 0.6
    }
    if (newOpts.target_energy > 0.7) {
      newOpts.min_energy = 0.5
    }
  }
  const availableGenres = extractGenres(selection, genres)
  newOpts.seed_genres = availableGenres.slice(
    0,
    5 - (newOpts.seed_artists?.length || 0) - (newOpts.seed_tracks?.length || 0)
  )
  return newOpts
}
