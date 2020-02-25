import Color from 'color'
import Vibrant from 'node-vibrant'
import React, { useEffect, useState } from 'react'
import { Artist } from 'react-spotify-api'

const InsightsArtists = ({ userData }: { userData: ISpotifyUserData }) => {
  const [artistBackgroundURL, setArtistBackgroundURL] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#c7ecee')
  const [textColor, setTextColor] = useState('black')
  const [altTextColor, setAltTextColor] = useState('black')
  const [altBackgroundColor, setAltBackgroundColor] = useState('#dff9fb')
  useEffect(() => {
    const setColors = async (image: any) => {
      await Vibrant.from(image)
        .getPalette()
        .then(palette => {
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

  const onClickArtist = (url: string) => (e: any) => window.open(url, 'name')

  return (
    <div
      className="artists"
      style={{
        backgroundColor: altTextColor,
      }}
    >
      <div
        className="artists-header"
        style={{
          color: altBackgroundColor,
          textShadow:
            '2px 2px 3px' +
            Color(altTextColor)
              .darken(0.3)
              .hex(),
        }}
      >
        Artists
      </div>
      <div className="artists-container">
        <div className="artists-text" style={{ color: altBackgroundColor }}>
          Here are your favourite 30 artists of all time according to Spotify.
        </div>
      </div>
      <div className="rank-text" style={{ color: altBackgroundColor }}>
        <em>Rank: Yours</em>
      </div>
      {userData.topArtistsLongTerm.length ? (
        <Artist id={userData.topArtistsLongTerm.slice(0, 30).map(v => v.id)}>
          {(
            artists: SpotifyApi.MultipleArtistsResponse,
            loading: boolean,
            error: SpotifyApi.ErrorObject
          ) => {
            if (artists && artists.artists) {
              if (artists.artists.length > 1) {
                setArtistBackgroundURL(artists.artists[1].images[0].url)
              } else {
                setArtistBackgroundURL(artists.artists[0].images[0].url)
              }
              return artists.artists.map((artist, index) => (
                <div
                  className="spotify-container shadow-lg"
                  style={{ backgroundColor: textColor }}
                  key={artist.id}
                  onClick={onClickArtist(artist.external_urls.spotify)}
                >
                  <img
                    src={artist.images[0].url}
                    className="top-image"
                    alt=""
                  />
                  <p className="artist-name" style={{ color: backgroundColor }}>
                    {artist.name}
                    <br />
                    {index + 1}
                  </p>
                </div>
              ))
            } else {
              return null
            }
          }}
        </Artist>
      ) : null}
      <div className="after-artists" />
    </div>
  )
}

export default InsightsArtists
