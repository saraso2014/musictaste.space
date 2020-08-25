import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Marquee, {
  Motion,
  randomIntFromInterval,
  Scale,
} from 'react-marquee-slider'
import { shrinkOnHover } from '../../constants/animationVariants'
import useWindowSize from '../../hooks/useWindowSize'
import { SelectOptions } from './index'

const MarqueeComponent = ({
  selectedOptions,
  backgroundColor,
}: {
  selectedOptions: SelectOptions[]
  backgroundColor: string
}) => {
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { width } = useWindowSize()
  useEffect(() => {
    if (selectedOptions.length) {
      setTriggerLoading(true)
      setDone(false)
      const handle = setTimeout(() => setTriggerLoading(false), 500)
      return () => clearTimeout(handle)
    }
  }, [selectedOptions])
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
      {!triggerLoading && width && width > 900 ? (
        <div className="w-100 h-100">
          <Marquee
            scatterRandomly={true}
            velocity={50}
            resetAfterTries={800}
            onInit={() => null}
            onFinish={() => setDone(true)}
            direction={'rtl'}
          >
            {selectedOptions.map((option, id) => (
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
                            ? (option.data.data as SpotifyApi.ArtistObjectFull)
                                .images[0].url
                            : (option.data.data as SpotifyApi.TrackObjectFull)
                                .album.images[0].url
                          : null
                      })`,
                    }}
                  />
                </Scale>
              </Motion>
            ))}
          </Marquee>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="marquee-area" style={{ backgroundColor }}>
      <div className="w-100 h-100 d-flex flex-row justify-content-center align-items-center h1">
        Provide me some inspiration!
      </div>
    </div>
  )
}

export default MarqueeComponent
