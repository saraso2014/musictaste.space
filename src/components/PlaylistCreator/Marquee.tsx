import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Marquee, {
  Motion,
  randomIntFromInterval,
  Scale,
} from 'react-marquee-slider'
import { shrinkOnHover } from '../../constants/animationVariants'
import useWindowSize from '../../hooks/useWindowSize'
import { Dot } from '../Aux/Dot'
import { SelectOptions } from './index'

const MarqueeComponent = ({
  selectedOptions,
  backgroundColor,
  recommendationOptions,
}: {
  selectedOptions: SelectOptions[]
  backgroundColor: string
  recommendationOptions: SpotifyApi.RecommendationsOptionsObject
}) => {
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [emojis, setEmojis] = useState<
    Array<{ emoji: string; scale: number; value: number }>
  >([])
  const { width } = useWindowSize()
  useEffect(() => {
    const entries = Object.entries(recommendationOptions)
    if (entries.length) {
      const emojiTemp: Array<{
        emoji: string
        scale: number
        value: number
      }> = []
      entries.forEach(([key, value]) => {
        switch (key) {
          case 'target_valence':
            if (value > 0.7) {
              emojiTemp.push({
                emoji: '😄',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.5) {
              emojiTemp.push({
                emoji: '😊',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.3) {
              emojiTemp.push({
                emoji: '😢',
                value,
                scale: Math.exp(1 - value),
              })
            } else {
              emojiTemp.push({
                emoji: '😭',
                value,
                scale: Math.exp(1 - value),
              })
            }
            break
          case 'target_danceability':
            if (value > 0.5) {
              emojiTemp.push({
                emoji: '💃',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            } else {
              emojiTemp.push({
                emoji: '😪',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
          case 'target_energy':
            if (value > 0.7) {
              emojiTemp.push({
                emoji: '🤪',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.5) {
              emojiTemp.push({
                emoji: '😬',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.3) {
              emojiTemp.push({
                emoji: '🥱',
                value,
                scale: Math.exp(1 - value),
              })
            } else {
              emojiTemp.push({
                emoji: '😴',
                value,
                scale: Math.exp(1 - value),
              })
            }
            break
          case 'target_popularity':
            if (value > 0.7) {
              emojiTemp.push({
                emoji: '🤩',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.5) {
              emojiTemp.push({
                emoji: '😎',
                value,
                scale: Math.exp(value - 0.5),
              })
              break
            }
            if (value > 0.3) {
              emojiTemp.push({
                emoji: '👁️',
                value,
                scale: Math.exp(1 - value),
              })
            } else {
              emojiTemp.push({
                emoji: '👀',
                value,
                scale: Math.exp(1 - value),
              })
            }
            break
          default:
            break
        }
      })
      setEmojis(emojiTemp)
    }
    if (selectedOptions.length) {
      setTriggerLoading(true)
      setDone(false)
      const handle = setTimeout(() => setTriggerLoading(false), 500)
      return () => clearTimeout(handle)
    }
  }, [selectedOptions, recommendationOptions])
  return selectedOptions.length ? (
    <div className="marquee-area" style={{ backgroundColor }}>
      <AnimatePresence>
        {!done ? (
          <div
            style={{
              position: 'absolute',
              width: 'inherit',
              height: 'inherit',
              left: '0',
              zIndex: 1,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-100 h-100 marquee-loading"
              style={{
                backgroundColor,
              }}
            >
              Loading...
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      {!triggerLoading && width && width > 800 ? (
        <div className="w-100 h-100">
          <Marquee
            scatterRandomly={true}
            velocity={50}
            resetAfterTries={1000}
            onInit={() => null}
            onFinish={() => setDone(true)}
            direction={'rtl'}
          >
            {emojis
              .map((emoji, id) => (
                <Motion
                  key={`child-${id}`}
                  initDeg={randomIntFromInterval(0, 360)}
                  direction={'clockwise'}
                  velocity={10}
                  radius={40}
                  backgroundColors={{
                    earth: 'transparent',
                    solarSystem: 'transparent',
                    buffer: 'transparent',
                  }}
                >
                  <Scale scale={emoji.scale}>
                    <motion.div
                      className="m-2 md:m-3"
                      whileHover="hover"
                      variants={shrinkOnHover(1.2)}
                      style={{ fontSize: '3em' }}
                    >
                      {emoji.emoji}
                    </motion.div>
                  </Scale>
                </Motion>
              ))
              .concat(
                selectedOptions.map((option, id) => (
                  <Motion
                    key={`child-${id}`}
                    initDeg={randomIntFromInterval(0, 360)}
                    direction={'clockwise'}
                    velocity={10}
                    radius={50}
                    backgroundColors={{
                      earth: 'transparent',
                      solarSystem: 'transparent',
                      buffer: 'transparent',
                    }}
                  >
                    <Scale scale={randomIntFromInterval(70, 100) / 100}>
                      <motion.div
                        className="m-2 md:m-3 option-images"
                        whileHover="hover"
                        variants={shrinkOnHover(1.2)}
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
                    </Scale>
                  </Motion>
                ))
              )}
          </Marquee>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="marquee-area" style={{ backgroundColor }}>
      <div className="w-100 h-100 d-flex flex-row justify-content-center align-items-center h1">
        Select some seeds<Dot>.</Dot>
        <Dot>.</Dot>
        <Dot>.</Dot>
      </div>
    </div>
  )
}

export default React.memo(MarqueeComponent)
