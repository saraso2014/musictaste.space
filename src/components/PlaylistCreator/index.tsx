/* eslint-disable @typescript-eslint/camelcase */
import Color from 'color'
import { cloneDeep, debounce } from 'lodash'
import Vibrant from 'node-vibrant'
import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { ActionMeta, OptionTypeBase, Theme, ValueType } from 'react-select'
import makeAnimated from 'react-select/animated'
import AsyncSelect from 'react-select/async'
import { useToasts } from 'react-toast-notifications'
import Spotify from 'spotify-web-api-js'
import { AuthContext } from '../../contexts/Auth'
import { UserDataContext } from '../../contexts/UserData'
import Footer from '../Footer'
import Navbar from '../Navbars/Navbar'
import GeneratedPlaylist from './GeneratedPlaylist'
import MarqueeComponent from './Marquee'
import Options from './Options'

export interface SelectOptions {
  label: string
  value: string
  data?: {
    type: 'artist' | 'track'
    data: SpotifyApi.ArtistObjectFull | SpotifyApi.TrackObjectFull
  }
}

const animatedComponents = makeAnimated()
const spotify = new Spotify()

const PlaylistCreator = () => {
  const { currentUser } = useContext(AuthContext)
  const { addToast } = useToasts()
  const { importData, importDataExists, spotifyToken } = useContext(
    UserDataContext
  )
  const [loading, setLoading] = useState(true)

  const [userDataOptions, setUserDataOptions] = useState<SelectOptions[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectOptions[]>([])
  const [recommendationOptions, setRecommendationOptions] = useState<
    SpotifyApi.RecommendationsOptionsObject
  >({})
  const [artistBackgroundURL, setArtistBackgroundURL] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#c7ecee')
  const [textColor, setTextColor] = useState('gray')
  const [altTextColor, setAltTextColor] = useState('gray')
  // const [altBackgroundColor, setAltBackgroundColor] = useState('#dff9fb')
  const [playlistTracks, setPlaylistTracks] = useState<
    SpotifyApi.TrackObjectFull[]
  >([])

  const handleChange = (
    val: ValueType<OptionTypeBase>,
    action: ActionMeta<OptionTypeBase>
  ) => {
    const value = (val as unknown) as SelectOptions[]
    const arr = Array.from(selectedOptions)
    switch (action.action) {
      case 'select-option':
        if (selectedOptions.length >= 5) {
          return false
        }
        setSelectedOptions(value)
        return
      case 'remove-value':
        const i = arr.findIndex(
          (item) => item.value === action.removedValue?.value
        )
        if (i !== -1) {
          arr.splice(i, 1)
          setSelectedOptions(arr)
        }
        return
      case 'clear':
        setSelectedOptions([])
        return
      default:
        return
    }
  }

  const selectTheme = (theme: Theme): Theme => ({
    ...theme,
    borderRadius: 10,
    colors: {
      ...theme.colors,
      primary25: Color(altTextColor).lighten(0.6).hex(),
      primary50: Color(altTextColor).lighten(0.5).hex(),
      primary75: Color(altTextColor).lighten(0.2).hex(),
      primary: textColor,
      neutral10: Color(backgroundColor).lighten(0.1).hex(),
      neutral20: Color(backgroundColor).lighten(0.1).hex(),
      neutral30: Color(backgroundColor).lighten(0.1).hex(),
      neutral40: Color(backgroundColor).lighten(0.1).hex(),
    },
  })

  useEffect(() => {
    const setColors = async (image: any) => {
      await Vibrant.from(image)
        .getPalette()
        .then((palette) => {
          if (
            palette.LightVibrant &&
            palette.DarkMuted &&
            palette.Vibrant &&
            palette.LightMuted
          ) {
            let c = Color(palette.LightVibrant.hex)
            const t = Color(palette.DarkMuted.hex)
            let d = Color(palette.LightMuted.hex)
            const u = Color(palette.Vibrant.hex)
            if (c.contrast(t) < 4) {
              c = c.lighten(0.4)
            } else if (c.contrast(t) < 7) {
              c = c.lighten(0.2)
            }
            if (d.contrast(u) < 4) {
              d = d.lighten(0.4)
            } else if (d.contrast(u) < 7) {
              d = d.lighten(0.2)
            }
            if (d.contrast(u) < 4) {
              d = Color('#ecf0f1')
            }
            setTextColor(t.hex())
            setAltTextColor(u.hex())
            // setAltBackgroundColor(d.hex())
            setBackgroundColor(c.hex())
          }
        })
    }
    if (artistBackgroundURL !== '') {
      setColors(artistBackgroundURL)
    }
  }, [artistBackgroundURL])

  const formatOptions = (options: SpotifyApi.RecommendationsOptionsObject) => {
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
    return newOpts
  }
  const getSuggestions = async () => {
    if (!selectedOptions.length) {
      addToast('Provide some artists or tracks as inspiration first!', {
        appearance: 'warning',
        autoDismiss: true,
      })
      return
    }
    return spotify
      .getRecommendations(formatOptions(recommendationOptions))
      .then((res) =>
        setPlaylistTracks(res.tracks as SpotifyApi.TrackObjectFull[])
      )
  }

  const saveToSpotify = async (emojis?: string) => {
    if (playlistTracks.length && currentUser) {
      try {
        const name = emojis || 'A playlist'
        const id = await spotify
          .createPlaylist(currentUser.uid.replace('spotify:', ''), {
            name,
            description: 'Made on musictaste.space',
            public: true,
          })
          .then((res) => res.id)
        await spotify.addTracksToPlaylist(
          id,
          playlistTracks.slice(0, 50).map((t) => `spotify:track:${t.id}`)
        )
        return { id, name }
      } catch (e) {
        addToast('There was an error creating your playlist.', {
          appearance: 'error',
        })
      }
    }
  }

  useEffect(() => {
    if (selectedOptions.length) {
      const data = selectedOptions[selectedOptions.length - 1].data
      if (!data) {
        return
      }
      if (data.type === 'artist') {
        setArtistBackgroundURL(
          (data.data as SpotifyApi.ArtistObjectFull).images[0].url
        )
      }
      if (data.type === 'track') {
        setArtistBackgroundURL(
          (data.data as SpotifyApi.TrackObjectFull).album.images[0].url
        )
      }
    }
  }, [selectedOptions])

  useEffect(() => {
    const getArtists = async (ids: string[]) => {
      try {
        const artists = await spotify.getArtists(ids)
        const options = artists.artists.map(
          (a) =>
            ({
              label: a.name,
              value: a.id,
              data: { type: 'artist', data: a },
            } as SelectOptions)
        )
        setUserDataOptions(options)
      } catch (e) {
        console.error(e)
      }
    }
    if (importDataExists && importData && spotifyToken) {
      spotify.setAccessToken(spotifyToken)
      const ids = importData.topArtistsShortTerm.map((a) => a.id).slice(0, 20)
      if (ids) {
        getArtists(ids).then(() => setLoading(false))
      }
    }
  }, [importData, importDataExists, spotifyToken])

  const searchSpotify = (
    inputVal: string,
    callback: (res: SelectOptions[]) => void
  ) => {
    if (inputVal.length > 3) {
      spotify.search(inputVal, ['track', 'artist']).then((res) => {
        let results: SelectOptions[] = []
        if (res.artists) {
          results = results.concat(
            res.artists.items.slice(0, 5).map(
              (a) =>
                ({
                  label: `${a.name}`,
                  value: a.id,
                  data: { type: 'artist', data: a },
                } as SelectOptions)
            )
          )
        }
        if (res.tracks) {
          results = results.concat(
            res.tracks.items.map(
              (t) =>
                ({
                  label: `${t.name} (${t.artists
                    .map((a) => a.name)
                    .join(', ')})`,
                  value: t.id,
                  data: { type: 'track', data: t },
                } as SelectOptions)
            )
          )
        }
        callback(
          results.filter((i) =>
            i.label.toLowerCase().includes(inputVal.toLowerCase())
          )
        )
        return
      })
    } else {
      callback(
        userDataOptions.filter((i) =>
          i.label.toLowerCase().includes(inputVal.toLowerCase())
        )
      )
      return
    }
  }
  return (
    <>
      <Navbar />
      <Helmet>
        <title>Playlist Generator - musictaste.space</title>
      </Helmet>
      <div
        className="playlist-creator wrapper"
        style={{ backgroundColor: `${backgroundColor}` }}
      >
        <div className="container pad-container">
          {!loading ? (
            <div className="mt-0">
              <div className="d-none d-lg-block w-100 h-100">
                <MarqueeComponent
                  selectedOptions={selectedOptions}
                  backgroundColor={
                    Color(backgroundColor).contrast(Color('white')) > 1
                      ? Color(backgroundColor).lighten(0.05).hex()
                      : Color(backgroundColor).darken(0.1).hex()
                  }
                  recommendationOptions={recommendationOptions}
                />
              </div>
            </div>
          ) : (
            <div className="w-100 h-100 d-none d-lg-block">
              <div className="marquee-area">
                <div className="loading" />
              </div>
            </div>
          )}

          <div className="separator" />
          <div className="row m-1 mt-5" />
          <div className="title-div">
            <a id="my-account" className="title" href="#generator">
              Playlist Generator
            </a>
          </div>
          {!loading ? (
            <AsyncSelect
              className="selector"
              isMulti={true}
              cacheOptions={true}
              defaultOptions={true}
              value={selectedOptions}
              components={animatedComponents}
              onChange={handleChange}
              theme={selectTheme}
              placeholder="Select up to five artists or tracks..."
              loadOptions={debounce(searchSpotify, 1000, {
                trailing: true,
                maxWait: 2000,
              })}
            />
          ) : (
            <div className="loading rounded" style={{ height: '40px' }} />
          )}
          <div className="row m-1 mt-5">
            {!loading ? (
              <div
                className="col-lg-6 options-container rounded p-3 p-md-3"
                style={{
                  backgroundColor:
                    Color(backgroundColor).contrast(Color('white')) > 1
                      ? Color(backgroundColor).lighten(0.05).hex()
                      : Color(backgroundColor).darken(0.1).hex(),
                }}
              >
                <Options
                  selectedOptions={selectedOptions}
                  setOptions={setRecommendationOptions}
                  altColor={altTextColor}
                  bgColor={backgroundColor}
                  getSuggestions={getSuggestions}
                />
              </div>
            ) : (
              <div className="col-lg-6 options-container rounded p-0">
                <div className="loading p-3" style={{ height: '728px' }} />
              </div>
            )}
            <div className="w-100 h-100 d-block d-lg-none m-3" />
            <div className="col-lg-5 offset-md-1 col output-container rounded">
              <GeneratedPlaylist
                playlistTracks={playlistTracks}
                recommendationOptions={recommendationOptions}
                saveToSpotify={saveToSpotify}
              />
            </div>
          </div>
          <div className="mb-5" />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default PlaylistCreator
