import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleChevronLeft,
  faCircleChevronRight,
  faCirclePlay,
  faCirclePause
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import './assets/base.css'

const control = (command: string) => {
  window.electron.ipcRenderer.send(command)
}
function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [isPlaying, setIsPlaying] = useState(false)
  const nowPlaying = 'Now Playing'
  const playPauseMedia = () => {
    if (isPlaying) {
      control('pause')
    } else {
      control('play')
    }
    setIsPlaying(!isPlaying)
  }
  const nextMedia = () => {
    control('next')
    console.log('next')
  }
  const previousMedia = () => {
    control('previous')
    console.log('previous')
  }
  return (
    <div className="w-screen h-screen  text-white glass">
      <div className=" opacity-100 text-center  flex-row ">
        <div className="">{nowPlaying}</div>
        <div className="text-4xl flex gap-6 text-center justify-center">
          <motion.div
            className="w-10"
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
            onHoverStart={(e) => {}}
            onHoverEnd={(e) => {}}
          >
            <FontAwesomeIcon icon={faCircleChevronLeft} className="" onClick={previousMedia} />
          </motion.div>
          <motion.div
            className="w-10"
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
            onHoverStart={(e) => {}}
            onHoverEnd={(e) => {}}
          >
            <FontAwesomeIcon
              icon={isPlaying ? faCirclePlay : faCirclePause}
              onClick={playPauseMedia}
            />
          </motion.div>
          <motion.div
            className="w-10"
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
            onHoverStart={(e) => {}}
            onHoverEnd={(e) => {}}
          >
            <FontAwesomeIcon icon={faCircleChevronRight} className="" onClick={nextMedia} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App
