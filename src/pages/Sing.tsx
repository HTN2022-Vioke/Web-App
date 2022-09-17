import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Lrc, LrcLine, useRecoverAutoScrollImmediately } from 'react-lrc'
import useTimer from '../utils/useTimer'
import { LrcContext } from '../utils/context'

interface LineProps {
  active: boolean
  content: string
}

const Line: React.FC<LineProps> = ({ active, content }) => {
  if (active) {
    return <div className='text-center text-sky-400 my-5'>{content}</div>
  }
  return <div className='text-center text-gray-200 my-5'>{content}</div>
}

export const Sing: React.FC = () => {
  const [play, setPlay] = useState(false)
  const lrc = useContext(LrcContext)

  const audio = useMemo(() => new Audio('/lig.mp3'), []) 
  const {
    currentMillisecond,
    setCurrentMillisecond,
    reset,
    play: playLrc,
    pause: pauseLrc,
  } = useTimer()

  const {
    signal,
    recoverAutoScrollImmediately
  } = useRecoverAutoScrollImmediately()

  const lineRenderer = useCallback(
    ({ active, line: { content } }: { active: boolean; line: LrcLine }) => (
      <Line active={active} content={content}/>
    ),
    []
  )

  const changePitch =  async (change: number) => {

  }

  const toggleVocal = async () => {

  }

  const togglePlay = () => {
    setPlay((play) => {
      if (play) {
        audio.pause()
        pauseLrc()
        return false
      }
      audio.play()
      playLrc()
      return true
    })
  }

  return (
    <>
      <div className="bg-[url('/assets/sample.webp')] bg-no-repeat bg-cover hover:cursor-pointer z-0 absolute h-full w-full"/>
      <div className='bg-black absolute z-[5] h-full w-full opacity-60'/>
      <div className='text-3xl font-sans w-screen h-screen flex flex-row text-white z-10 relative' onClick={togglePlay}>
        <div className='flex-1 bg-slate-800'>

        </div>
        <div className="flex-[6] " >
          <Lrc
            lrc={lrc}
            lineRenderer={lineRenderer}
            verticalSpace
            currentMillisecond={currentMillisecond}
          />
        </div>
        
      </div>\
    </>
  )
}

export default Sing