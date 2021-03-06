import { firestore } from 'firebase/app'
import cloneDeep from 'lodash/cloneDeep'
import qs from 'query-string'
import React, { useContext, useEffect, useState } from 'react'
import GoogleAnalytics from 'react-ga'
import Helmet from 'react-helmet'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { SpotifyApiContext } from 'react-spotify-api'
import { AuthContext } from '../../contexts/Auth'
import { UserDataContext } from '../../contexts/UserData'
import { clearMatchStorage } from '../../util/clearLocalStorage'
import firebase from '../../util/Firebase'
import {
  decryptArray,
  encryptArray,
  getFromObject,
  setIntoObject,
} from '../../util/fromObjectInLocalStorage'
import Navbar from '../Navbars/Navbar'
import Artists from './Artists'
import Genres from './Genres'
import Header from './Header'
import Playlist from './Playlist'
import Tracks from './Tracks'

const _log = (matchId: string) => (
  ...rest: Array<string | number | object>
) => {
  console.log(`[MATCH 🤝] ${matchId}:`, ...rest)
}

const Result = () => {
  const history = useHistory()
  window.scrollTo(0, 0)
  const { currentUser } = useContext(AuthContext)
  const { spotifyToken, userData } = useContext(UserDataContext)

  const [matchUser, setMatchUser] = useState<IPreviewMatchData | null>(null)
  const [matchUserId, setMatchUserId] = useState('')
  const [matchData, setMatchData] = useState<IMatchData | null>(null)
  const { matchId } = useParams()
  const [isLSData, setIsLSData] = useState(false)
  const [error, setError] = useState({ state: false, message: <></> })
  const query = qs.parse(useLocation().search)

  useEffect(() => {
    const getMatchData = async (id: string) => {
      const d = await firebase.getMatch(id).catch(() => null)
      if (!d) {
        setError({
          state: true,
          message: <>Something went wrong retrieving this match.</>,
        })
        return
      } else {
        setMatchData(d)
        const matchUser = await firebase.userHasMatchForMatchId(
          currentUser?.uid as string,
          id
        )
        if (matchUser.data && matchUser.id) {
          setMatchUserId(matchUser.id)
          setMatchUser(matchUser.data)
        }
      }
      if (matchId === 'false') {
        setError({
          state: true,
          message: (
            <>
              Oops, something went wrong with the match making bot. Try again,
              or if it&apos;s still not working, find me on{' '}
              <a href="https://www.twitter.com/_kalpal">Twitter</a>.
            </>
          ),
        })
      }
    }
    if (currentUser && matchId) {
      const _consoleLog = _log(matchId)
      const matchStr = getFromObject('matches')(matchId)
      if (matchStr && !query.cc) {
        try {
          const match = JSON.parse(matchStr)
          match.matchDate = firestore.Timestamp.fromDate(
            new Date(match.matchDate)
          )
          match.users = decryptArray(match.users)
          setMatchUser(JSON.parse(match.matchUser))
          setMatchUserId(match.matchUserId)
          setMatchData(match)
          setIsLSData(true)
          _consoleLog('loaded match from local storage.')
          GoogleAnalytics.event({
            category: 'Cache',
            label: 'Loaded Cached Match',
            action: 'Loaded a cached match from local storage',
          })
        } catch (e) {
          _consoleLog('error with cache')
          clearMatchStorage()
          _consoleLog('pulling match data from database.')
          getMatchData(matchId)
        }
      } else {
        if (query.cc) {
          _consoleLog('force pulling match data from database.')
        } else {
          _consoleLog('pulling match data from database.')
        }
        getMatchData(matchId)
      }
    }
  }, [currentUser, matchId, query.cc])

  useEffect(() => {
    if (!isLSData && matchUser && matchUserId && matchData && matchId) {
      const md = cloneDeep(matchData) as any
      md.matchUser = JSON.stringify(matchUser)
      md.matchUserId = matchUserId
      md.matchDate = md.matchDate.toDate().toISOString()
      md.users = encryptArray(matchData.users)
      const mdStr = JSON.stringify(md)
      setIntoObject('matches')(matchId, mdStr)
      _log(matchId)('stored match data in local storage.')
    }
  }, [matchUser, matchUserId, matchData, matchId, isLSData])

  const handleClick = () => {
    GoogleAnalytics.event({
      category: 'Interaction',
      label: 'Visit Playlist',
      action: 'Visited create playlist page from match',
    })
    history.push('/playlist/' + matchId + '?from=match')
  }
  return (
    <>
      <Helmet>
        <title>
          {matchUser && userData
            ? `${matchUser.anon ? matchUserId : matchUser.displayName}
            ${' × '}
            ${userData.displayName}`
            : 'Result'}{' '}
          - musictaste.space
        </title>
      </Helmet>
      <SpotifyApiContext.Provider value={spotifyToken}>
        <Navbar />
        <div className="result">
          {currentUser && matchUser && matchData && userData ? (
            <>
              <Header
                matchData={matchData}
                matchUser={matchUser}
                userData={userData}
                matchUserId={matchUserId}
              />
              <Artists
                matchData={matchData}
                matchUser={(matchUser as unknown) as IUsersLookupData}
                uid={currentUser?.uid || ''}
                matchUserId={matchUserId}
              />
              <Tracks
                matchData={matchData}
                matchUser={(matchUser as unknown) as IUsersLookupData}
                uid={currentUser?.uid || ''}
                matchUserId={matchUserId}
              />
              <Genres history={history} matchData={matchData} />
              {matchData.score > 0.5 &&
              (matchData.matchedTracksLongTerm.length ||
                matchData.matchedTracksMediumTerm.length ||
                matchData.matchedTracksShortTerm.length) ? (
                <Playlist
                  token={userData.accessToken}
                  artistID={
                    matchData.matchedArtists[
                      Math.floor(
                        Math.random() * matchData.matchedArtists.length
                      )
                    ].id
                  }
                  matchName={
                    matchUser.anon
                      ? 'this mysterious person'
                      : matchUser.displayName
                  }
                  handleClick={handleClick}
                  profileImage={matchUser.photoURL}
                />
              ) : null}
            </>
          ) : (
            <div className="coming-soon">
              <div className="error">{error.message}</div>
            </div>
          )}
        </div>
      </SpotifyApiContext.Provider>
    </>
  )
}

export default Result
