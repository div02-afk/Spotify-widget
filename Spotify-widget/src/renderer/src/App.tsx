

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleChevronLeft, faCircleChevronRight ,faCirclePlay, faCirclePause} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'


const control = (command: string) => {
  
  window.electron.ipcRenderer.send(command)
}
function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [isPlaying, setIsPlaying] = useState(false)
  const nowPlaying = 'Now Playing';
  const playPauseMedia = () => {
    if(isPlaying){
      control('pause')
    }
    else{
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
    <div className="w-screen h-screen bg-blue-300 p-0.5 rounded-2xl  text-white">
      <div className=" opacity-100 text-center  flex-row ">
        <div className=''>{nowPlaying}</div>
        <div className="text-center text-4xl justify-evenly">
          <FontAwesomeIcon icon={faCircleChevronLeft} className="mr-10" onClick={previousMedia} />
          <FontAwesomeIcon
            icon={isPlaying ? faCirclePlay : faCirclePause}
            onClick={playPauseMedia}
          />
          <FontAwesomeIcon icon={faCircleChevronRight} className="ml-10" onClick={nextMedia} />
        </div>
      </div>
    </div>
  )
}

export default App
