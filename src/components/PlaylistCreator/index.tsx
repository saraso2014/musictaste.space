import { debounce } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import makeAnimated from 'react-select/animated'
import AsyncSelect from 'react-select/async'

import Color from 'color'
import { AnimatePresence, motion } from 'framer-motion'
import Vibrant from 'node-vibrant'
import { ActionMeta, OptionTypeBase, Theme, ValueType } from 'react-select'
import Spotify from 'spotify-web-api-js'
import { growAndShrink, zoomFadeIn } from '../../constants/animationVariants'
import { AuthContext } from '../../contexts/Auth'
import { UserDataContext } from '../../contexts/UserData'
import Navbar from '../Navbars/Navbar'
import MarqueeComponent from './Marquee'

export interface SelectOptions {
  label: string
  value: string
  data?: {
    type: 'artist' | 'track'
    data: SpotifyApi.ArtistObjectFull | SpotifyApi.TrackObjectFull
  }
}
const animatedComponents = makeAnimated()

const PlaylistCreator = () => {
  const { currentUser } = useContext(AuthContext)
  const { importData, importDataExists, spotifyToken } = useContext(
    UserDataContext
  )
  const [loading, setLoading] = useState(true)

  const [userDataOptions, setUserDataOptions] = useState<SelectOptions[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectOptions[]>([])
  const [artistBackgroundURL, setArtistBackgroundURL] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#c7ecee')
  const [textColor, setTextColor] = useState('gray')
  const [altTextColor, setAltTextColor] = useState('gray')
  const [altBackgroundColor, setAltBackgroundColor] = useState('#dff9fb')

  const spotify = new Spotify()

  const handleChange = (
    val: ValueType<OptionTypeBase>,
    action: ActionMeta<OptionTypeBase>
  ) => {
    const value = (val as unknown) as SelectOptions[]
    const arr = Array.from(selectedOptions)
    switch (action.action) {
      case 'select-option':
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
            setAltBackgroundColor(d.hex())
            setBackgroundColor(c.hex())
          }
        })
    }
    if (artistBackgroundURL !== '') {
      setColors(artistBackgroundURL)
    }
  }, [artistBackgroundURL])

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
  }, [importData, importDataExists])

  const searchSpotify = (
    inputVal: string,
    callback: (res: SelectOptions[]) => void
  ) => {
    console.log('called')
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
              components={animatedComponents}
              onChange={handleChange}
              theme={selectTheme}
              placeholder="Select up to five artists or tracks..."
              loadOptions={debounce(searchSpotify, 1000, {
                trailing: true,
                maxWait: 2000,
              })}
            />
          ) : null}
          {!loading ? (
            <div className="mt-5">
              <div className="d-flex d-lg-none flex-row justify-content-center align-items-center flex-wrap">
                <AnimatePresence>
                  {selectedOptions.map((option, i) => (
                    <motion.div
                      key={'option-div-' + option.value}
                      animate={true}
                    >
                      <motion.div
                        key={'option-' + option.value}
                        initial="initial"
                        exit="exit"
                        animate="enter"
                        variants={zoomFadeIn(0.5)}
                      >
                        <motion.div
                          animate="growAndShrink"
                          variants={growAndShrink(1.1, 0, 5)}
                          className="rounded m-2 md:m-3 option-images"
                          style={{
                            backgroundSize: 'cover',
                            backgroundImage: `url(${
                              option.data
                                ? option.data?.type === 'artist'
                                  ? (option.data
                                      .data as SpotifyApi.ArtistObjectFull)
                                      .images[0].url
                                  : (option.data
                                      .data as SpotifyApi.TrackObjectFull).album
                                      .images[0].url
                                : null
                            })`,
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="d-none d-lg-block w-100 h-100">
                <MarqueeComponent
                  selectedOptions={selectedOptions}
                  backgroundColor={Color(backgroundColor).lighten(0.05).hex()}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default PlaylistCreator
