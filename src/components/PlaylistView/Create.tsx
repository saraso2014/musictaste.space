import qs from 'query-string'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { SpotifyApiContext } from 'react-spotify-api'
import Spotify from 'spotify-web-api-js'
import { AuthContext } from '../../contexts/Auth'
import { Dot } from '../Aux/Dot'
import firebase from '../Firebase'
import Navbar from '../Navbars/Navbar'
import Canvas from './Canvas'
import CreatePlaylistButton from './CreatePlaylistButton'

const Create = (props: any) => {
  window.scrollTo(0, 0)
  const { currentUser, spotifyToken, userData } = useContext(AuthContext)
  const [matchUser, setMatchUser] = useState({} as IUsersLookupData)
  const [matchUserId, setMatchUserId] = useState('')
  const [artistImage, setArtistImage] = useState({
    url: '',
    height: 0,
    width: 0,
  })
  const [matchData, setMatchData] = useState({} as IMatchData)
  const { matchId } = useParams()
  const [playlistImage, setPlaylistImage] = useState('')
  const [error, setError] = useState({ state: false, message: '' })
  const [loading, setLoading] = useState(true)
  const history = useHistory()
  const location = useLocation()
  const query = qs.parse(location.search)
  const backToPlaylist = (e: any) => {
    query.from === 'match'
      ? history.push('/match/' + matchId)
      : history.push('/playlist')
  }

  async function createPlaylist(): Promise<{
    success: boolean
    uri?: string | undefined
    error?: {} | undefined
  }> {
    const s = new Spotify()
    let playlistError = {}
    s.setAccessToken(userData.accessToken)
    const res = await firebase
      .generatePlaylist(
        matchId as string,
        currentUser.uid,
        userData.serverState
      )
      .catch(err => (playlistError = err))
    if (res.success && res.tracks) {
      const d = (await s
        .createPlaylist(userData.spotifyID, {
          name: `${matchUser.anon ? matchUserId : matchUser.displayName} × ${
            userData.displayName
          }`,
          description: `A special playlist just for ${
            userData.displayName
          } and , ${
            matchUser.anon ? matchUserId : matchUser.displayName
          } made on musictaste.space.`,
        })
        .then(res => res)
        .catch(err => {
          setLoading(false)
          setError({
            state: true,
            message:
              'There was an error making the playlist. You might need to log in again to grant more permissions.',
          })
        })) as { id: string }
      await s.uploadCustomPlaylistCoverImage(d.id, playlistImage)
      let attempt = 0
      let tracks = { total: 0 }
      let playlistData
      do {
        attempt++
        s.addTracksToPlaylist(d.id, res.tracks.slice(0, 50))
        playlistData = await s
          .getPlaylist(d.id)
          .catch(err => (playlistError = err))
        tracks = await s
          .getPlaylistTracks(d.id)
          .catch(err => (playlistError = err))
      } while (tracks.total === 0 && attempt < 3)
      if (attempt !== 3) {
        firebase
          .createPlaylistInUser(
            currentUser.uid,
            matchUser.userId,
            d.id,
            playlistData
          )
          .catch()
        return {
          success: true,
          uri: (playlistData as SpotifyApi.PlaylistObjectFull).external_urls
            .spotify,
        }
      }
      return { success: false, error: playlistError }
    }
    return { success: false, error: playlistError }
  }

  useEffect(() => {
    const getMatchData = async (id: string) => {
      const e = await firebase.userHasMatchForMatchId(currentUser.uid, id)
      if (e.exists) {
        const d = await firebase.getMatch(id)
        const u = await firebase.getUserFromID(e.id as string)
        setMatchUserId(e.id as string)
        if (u) {
          setMatchUser(u)
        }
        if (!d) {
          setError({
            state: true,
            message: 'Something went wrong retrieving this match.',
          })
        } else {
          setMatchData(d)
          return d
        }
      } else {
        setError({
          state: true,
          message:
            "You don't have access to this match or the match does not exist.",
        })
      }
      setLoading(false)
      return false
    }
    const getPlaylistImage = async (data: IMatchData) => {
      const s = new Spotify()
      s.setAccessToken(userData.accessToken)
      s.getArtist(
        data.matchedArtists[
          Math.floor(Math.random() * data.matchedArtists.length)
        ].id
      ).then(res => {
        if (res) {
          setArtistImage({ ...res.images[0] } as any)
        }
      })
    }
    if (currentUser && matchId && Object.keys(userData).length !== 0) {
      getMatchData(matchId).then(s => {
        if (s) {
          getPlaylistImage(s)
        }
      })
      setLoading(false)
    }
  }, [currentUser, matchId, userData])
  let topTracks: IMatchedSpotifyPoint[] = []
  if (Object.keys(matchData).length > 0) {
    topTracks = matchData.matchedTracksLongTerm
      .concat(matchData.matchedTracksMediumTerm)
      .concat(matchData.matchedTracksShortTerm)
  }

  return (
    <>
      <SpotifyApiContext.Provider value={spotifyToken}>
        <Navbar />
        {loading ? (
          <div className="coming-soon" style={{ display: 'flex' }}>
            <Dot>.</Dot>
            <Dot>.</Dot>
            <Dot>.</Dot>
          </div>
        ) : (
          <div className="playlist-container animated fadeInUp">
            {topTracks.length ? (
              <div className="playlist">
                {artistImage.url !== '' ? (
                  <Canvas
                    text="Hello world!"
                    image={artistImage}
                    setPlaylistImage={setPlaylistImage}
                  />
                ) : null}
                <div className="playlist-names">
                  {matchUser.displayName} × {userData.displayName}
                </div>
                <CreatePlaylistButton createPlaylist={createPlaylist} />
                <p style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <a onClick={backToPlaylist} className="underline">
                    {query.from ? 'Back To Match' : 'Back To Playlists'}
                  </a>
                </p>
                <div className="description">
                  These playlists are based on your top tracks, shared artists,
                  and shared genres. It's a collection of songs that you can
                  both jam to in the car, or use to get to know each other
                  better. Depending on how high your score was, playlists can be
                  generated multiple times.
                </div>
              </div>
            ) : null}
            <div className="error">{error.message}</div>
          </div>
        )}
      </SpotifyApiContext.Provider>
    </>
  )
}

export default Create
