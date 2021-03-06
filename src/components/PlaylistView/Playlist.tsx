import React from 'react'
import { Helmet } from 'react-helmet'
import Navbar from '../Navbars/Navbar'
import MatchContainer from './MatchContainer'

const Playlist = () => {
  return (
    <>
      <Navbar />
      <Helmet>
        <title>Playlist Generator - musictaste.space</title>
      </Helmet>
      <div className="container main-container">
        <div className="playlist-info">
          <div className="main-text">
            Generate playlists based on artists and tracks you have in common
            with friends!
          </div>
          <div className="subtitle">
            You need to have a match score above 50% in order to generate a
            playlist.
          </div>
        </div>
        <div className="compatibility title-div  sub-title">
          <a id="matches" className="compatibility title" href="#matches">
            Playlistable Matches
          </a>
        </div>
        <MatchContainer />
      </div>
    </>
  )
}

export default Playlist
