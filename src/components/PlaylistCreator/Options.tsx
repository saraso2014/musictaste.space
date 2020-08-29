/* eslint-disable react/display-name */
import Color from 'color'
import emojiRegex from 'emoji-regex'
import { AnimatePresence, motion } from 'framer-motion'
import GraphemeSplitter from 'grapheme-splitter'
import { times } from 'lodash'
import React, { useEffect, useReducer, useState } from 'react'
import { SelectOptions } from '.'
import { transition } from '../../constants/animationVariants'
import { initialState, optionsReducer } from './optionsReducer'
import {
  createSelectionDescription,
  createTargetDescription,
} from './SentenceDescriptions'

const splitter = new GraphemeSplitter()

const RecommendationOptionsSelector = ({
  selectedOptions,
  setOptions,
  altColor,
  bgColor,
  getSuggestions,
}: {
  selectedOptions: SelectOptions[]
  altColor: string
  bgColor: string
  setOptions: (options: SpotifyApi.RecommendationsOptionsObject) => void
  getSuggestions: () => Promise<void>
}) => {
  const [state, dispatch] = useReducer(optionsReducer, initialState)
  const [input, setInput] = useState('')
  const [targetDesc, setTargetDesc] = useState<React.ReactNode | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedOptions.length) {
      const tracks = selectedOptions
        .filter((option) => option.data?.type === 'track')
        .map((option) => option.data?.data.id)

      const artists = selectedOptions
        .filter((option) => option.data?.type === 'artist')
        .map((option) => option.data?.data.id)
      if (tracks.length) {
        dispatch({ type: 'track', payload: { ids: tracks as string[] } })
      }
      if (artists.length) {
        dispatch({ type: 'artist', payload: { ids: artists as string[] } })
      }
    }
  }, [selectedOptions])

  const isClickable = !!selectedOptions.length

  useEffect(() => {
    setTargetDesc(createTargetDescription(state))
    setOptions(state)
  }, [state, setOptions])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const regex = emojiRegex()
    const matches = event.target.value.match(regex)
    setInput(matches?.join('') || '')
    dispatch({ type: 'clear' })
    splitter
      .splitGraphemes(event.target.value)
      .forEach((char) =>
        dispatch({ payload: { character: char }, type: 'target' })
      )
  }

  const onGetSuggestions = () => {
    setLoading(true)
    getSuggestions().finally(() => setLoading(false))
  }

  const targetClick = (emoji: string) => () => {
    dispatch({ type: 'target', payload: { character: emoji } })
    setInput(input + emoji)
  }
  const TargetButton = ({
    state,
    threshold,
    emoji,
    reversed,
  }: {
    state?: number
    threshold: number
    emoji: string
    reversed?: boolean
  }) => {
    let color: string
    if (!state) {
      color = altColor
    } else {
      if (reversed) {
        color =
          state > threshold
            ? Color(altColor)
                .darken(state - threshold)
                .hex()
            : Color(altColor).lighten(0.1).hex()
      } else {
        color =
          state < threshold
            ? Color(altColor)
                .darken(threshold - state)
                .hex()
            : Color(altColor).lighten(0.1).hex()
      }
    }
    const hidden = state && (reversed ? state < threshold : state > threshold)
    return (
      <motion.button
        whileHover={{ scale: 1.1, opacity: 1, transition: transition(0.1) }}
        whileTap={{ scale: 0.9, opacity: 1, transition: transition(0.1) }}
        style={{
          backgroundColor: color,
          opacity: !state ? '0.5' : hidden ? '0.3' : '1',
        }}
        onClick={targetClick(emoji)}
      >
        <span role="img" aria-label="option" className="emoji">
          {emoji}
        </span>
      </motion.button>
    )
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: '500px' }}>
      <div className="playlist-heading">
        <div className="heading-title">Seeds </div>
      </div>
      <div className="seed-list d-flex flex-row">
        <AnimatePresence>
          {selectedOptions.length
            ? selectedOptions.map((option, id) => (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    transition: { delay: 0.5, duration: 0.5 },
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  key={`seed-${id}`}
                  className="seed-preview"
                  style={{
                    backgroundSize: 'cover',
                    backgroundImage: `url(${
                      option.data
                        ? option.data?.type === 'artist'
                          ? (option.data.data as SpotifyApi.ArtistObjectFull)
                              .images[0].url
                          : (option.data.data as SpotifyApi.TrackObjectFull)
                              .album.images[0].url
                        : null
                    })`,
                  }}
                />
              ))
            : times(5, (i) => (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    transition: { delay: i / 4, duration: 0.5 },
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  key={`seed-temp-${i}`}
                  className="seed-preview"
                  style={{
                    backgroundColor: Color('rgb(199, 236, 238)')
                      .darken(0.1 * (5 - i))
                      .hex(),
                  }}
                />
              ))}
        </AnimatePresence>
      </div>
      <motion.div animate={true} className=" mt-4">
        {createSelectionDescription(selectedOptions)}
      </motion.div>
      <div className="playlist-heading">
        <div className="heading-title">Description</div>
      </div>
      <motion.div animate={true} className="mb-2">
        {targetDesc || 'Specify more options below to refine your playlist.'}
      </motion.div>
      <div className="playlist-heading">
        <div className="heading-title">Options</div>
      </div>{' '}
      <div className="w-100 d-flex flex-row justify-contents-center align-items-center">
        <input
          className="w-100 emoji-input"
          onChange={handleInputChange}
          value={input}
        />
      </div>
      <div className="option-buttons d-flex flex-row">
        <TargetButton
          state={state.target_valence}
          threshold={0.5}
          emoji={'😄'}
          reversed={true}
        />
        <TargetButton
          state={state.target_energy}
          threshold={0.7}
          emoji={'🤪'}
          reversed={true}
        />
        <TargetButton
          state={state.target_popularity}
          threshold={0.6}
          emoji={'😎'}
          reversed={true}
        />
        <TargetButton
          state={state.target_danceability}
          threshold={0.6}
          emoji={'💃'}
          reversed={true}
        />
        <TargetButton
          state={state.target_acousticness}
          threshold={0.2}
          emoji={'🎹'}
          reversed={true}
        />
      </div>
      <div className="option-buttons d-flex flex-row">
        <TargetButton
          state={state.target_valence}
          threshold={0.5}
          emoji={'😢'}
        />
        <TargetButton
          state={state.target_energy}
          threshold={0.7}
          emoji={'🥱'}
        />
        <TargetButton
          state={state.target_popularity}
          threshold={0.6}
          emoji={'👀'}
        />
        <TargetButton
          state={state.target_danceability}
          threshold={0.6}
          emoji={'🙅‍♀️'}
        />
        <TargetButton
          state={state.target_acousticness}
          threshold={0.2}
          emoji={'🤖'}
        />
      </div>
      <div className="mt-3">
        <div className="d-flex w-100 justify-content-center">
          <motion.button
            whileHover={{ scale: 1.1, opacity: 1, transition: transition(0.1) }}
            whileTap={{ scale: 0.9, opacity: 1, transition: transition(0.1) }}
            className="generate-button text-center"
            disabled={!isClickable}
            // style={{ filter: !isClickable ? 'grayscale(100%)' : 'none' }}
            onClick={onGetSuggestions}
          >
            {!loading ? (
              <span style={{ paddingLeft: '5px' }}>
                <i className="fas fa-play" />
              </span>
            ) : (
              <i className="fas fa-spinner fa-pulse" />
            )}
          </motion.button>
          {/* <code>{JSON.stringify(state, null, '\t')}</code> */}
        </div>
      </div>
    </div>
  )
}

export default RecommendationOptionsSelector
