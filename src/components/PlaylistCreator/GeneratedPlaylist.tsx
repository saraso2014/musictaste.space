/* eslint-disable @typescript-eslint/camelcase */
import Color from 'color'
import { AnimatePresence, motion } from 'framer-motion'
import { times } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import SimpleBar from 'simplebar-react'
import { transition } from '../../constants/animationVariants'
import { UserDataContext } from '../../contexts/UserData'
import useWindowSize from '../../hooks/useWindowSize'

interface TrackProps {
  backgroundColor: string
  textColor: string
  track: SpotifyApi.TrackObjectFull
  index: number
}

interface DemoTrackProps {
  backgroundColor: string
  textColor: string
  index: number
  width: undefined | number
}

const Track = ({ backgroundColor, textColor, track, index }: TrackProps) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, delay: index > 10 ? 0 : index / 5 },
    }}
    exit={{
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.5, delay: index / 5 },
    }}
    className="spotify-container playlist shadow-lg"
    style={{ backgroundColor }}
    key={index + track.id}
  >
    <div className="d-flex flex-row align-items-center">
      <img src={track.album.images[0]?.url} className="top-image" alt="" />
      <p className="artist-name" style={{ color: textColor }}>
        {track.name}
        <br />
        <span style={{ color: Color(textColor).darken(0.4).hex() }}>
          {track.artists.map((a) => a.name).join(', ')}
        </span>
        <br />
      </p>
    </div>
    <div
      className="position"
      style={{ color: Color(backgroundColor).lighten(0.2).hex() }}
    >
      {index + 1}
    </div>
  </motion.div>
)

const DemoTrack = ({
  backgroundColor,
  textColor,
  index,
  width,
}: DemoTrackProps) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{
      y: 0,
      opacity: 1 - index / 8,
      transition: { duration: 0.5, delay: index > 10 ? 0 : index / 5 },
    }}
    exit={{
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.5, delay: index / 5 },
    }}
    className="spotify-container playlist shadow-lg"
    style={{ backgroundColor }}
    key={index}
  >
    <div className="d-flex flex-row align-items-center">
      <div
        className="top-image"
        style={{ backgroundColor: Color(backgroundColor).darken(0.2).hex() }}
      />
      <div className="d-flex flex-column">
        <div
          className="text-demo"
          style={{
            width: `${
              ((2 + (index % 3)) * 20 + 100) / (width && width > 600 ? 1 : 1.3)
            }px`,
            backgroundColor: Color(textColor).darken(0.5).hex(),
          }}
        />
        <div
          className="text-demo"
          style={{
            width: `${
              ((5 - (index % 5)) * 10 + 60) / (width && width > 600 ? 1 : 1.3)
            }px`,
            backgroundColor: Color(textColor).darken(0.5).hex(),
          }}
        />
      </div>
    </div>
    <div
      className="position"
      style={{ color: Color(backgroundColor).lighten(0.2).hex() }}
    >
      {index + 1}
    </div>
  </motion.div>
)

const GeneratedPlaylist = ({
  recommendationOptions,
  playlistTracks,
  saveToSpotify,
}: {
  recommendationOptions: SpotifyApi.RecommendationsOptionsObject
  playlistTracks: SpotifyApi.TrackObjectFull[]
  saveToSpotify: () => Promise<{ id: string; name: string } | undefined>
}) => {
  const { userData } = useContext(UserDataContext)
  const [loading, setLoading] = useState(false)
  const [playlistName, setPlaylistName] = useState<string | null>(null)
  const [playlistURI, setPlaylistURI] = useState<string | null>(null)
  const { width } = useWindowSize()

  useEffect(() => {
    setPlaylistName(null)
    setPlaylistURI(null)
    setLoading(false)
  }, [playlistTracks])

  const onSaveClick = () => {
    setLoading(true)
    saveToSpotify()
      .then((res) => {
        if (res) {
          setPlaylistURI(res.id)
          setPlaylistName(res.name)
        }
      })
      .finally(() => setLoading(false))
  }

  const onOpenPlaylist = () => {
    window.open(`spotify:playlist:${playlistURI}`)
  }
  return (
    <div className="output-container">
      <div className="save-options w-100 d-flex flex-row justify-content-between align-items-center pb-3">
        <div className="d-flex flex-row align-items-center">
          <div
            className="profile-image"
            style={{
              backgroundImage: `url(${userData?.photoURL})`,
              filter: playlistTracks.length ? 'none' : 'grayscale(100%)',
              opacity: playlistTracks.length ? 1 : 0.5,
            }}
          />
          <AnimatePresence exitBeforeEnter={true}>
            {playlistName ? (
              <div className="d-flex flex-column ml-2">
                <div style={{ color: 'white' }}>{playlistName}</div>
                <div style={{ color: Color('white').darken(0.4).hex() }}>
                  By {userData?.displayName}
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column">
                <div
                  className="text-demo"
                  style={{
                    width: `${
                      ((2 + (2 % 3)) * 20 + 100) /
                      (width && width > 600 ? 1 : 1.3)
                    }px`,
                    backgroundColor: Color('white').darken(0.8).hex(),
                  }}
                />
                <div
                  className="text-demo"
                  style={{
                    width: `${
                      ((5 - (2 % 5)) * 10 + 60) /
                      (width && width > 600 ? 1 : 1.3)
                    }px`,
                    backgroundColor: Color('white').darken(0.8).hex(),
                  }}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ opacity: playlistTracks.length ? 1 : 0.5 }}>
          <motion.button
            className="save-button"
            style={{
              backgroundColor: playlistTracks.length ? '#1db954' : '#535353',
            }}
            whileHover={{ scale: 1.1, opacity: 1, transition: transition(0.1) }}
            whileTap={{ scale: 0.9, opacity: 1, transition: transition(0.1) }}
            onClick={playlistURI ? onOpenPlaylist : onSaveClick}
          >
            {loading ? (
              <i className="fas fa-spinner fa-pulse" />
            ) : playlistURI ? (
              <i className="fas fa-external-link-alt" />
            ) : (
              <i className="far fa-share-square" />
            )}
          </motion.button>
        </div>
      </div>
      <SimpleBar
        forceVisible="y"
        autoHide={false}
        className="playlist-output-container"
      >
        <AnimatePresence>
          {playlistTracks.length
            ? playlistTracks.map((t, i) => (
                <Track
                  key={i}
                  index={i}
                  backgroundColor={'#535353'}
                  textColor={'white'}
                  track={t as SpotifyApi.TrackObjectFull}
                />
              ))
            : times(8, (i) => (
                <DemoTrack
                  key={i}
                  index={i}
                  backgroundColor={'#535353'}
                  textColor={'white'}
                  width={width}
                />
              ))}
        </AnimatePresence>
      </SimpleBar>
    </div>
  )
}
export default GeneratedPlaylist
