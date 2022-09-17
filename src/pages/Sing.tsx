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
  const [playBack, setPlayBack] = useState(true)
  const [curTrack, setCurTrack] = useState<HTMLAudioElement>(null)
  const [destination, setDestination] = useState<AudioDestinationNode>(null)
  const [mic, setMic] = useState<MediaStreamAudioSourceNode>(null)
  const lrc = useContext(LrcContext)

  const audioNv = useMemo(() => new Audio('/lig-nv.wav'), []) 
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
    const curTime = curTrack.currentTime
    setCurTrack(track => {
      track.pause()
      if (track === audioNv) {
        audio.currentTime = curTime
        audio.play()
        return audio
      }
      audioNv.currentTime = curTime
      audioNv.play()
      return audioNv
    })
    
  }

  const togglePlayback = () => {
    setPlayBack((playback) => !playback)
  }

  const togglePlay = () => {
    setPlay((play) => {
      if (play) {
        curTrack.pause()
        pauseLrc()
        return false
      }
      curTrack.play()
      playLrc()
      return true
    })
  }

  useEffect(() => {
    initPlayback()
    setCurTrack(audioNv)
  }, [])

  useEffect(() => {
    if (destination === null || mic === null) return
    if (playBack) {
      mic.connect(destination)
    }
    else {
      mic.disconnect()
    }
  }, [destination, mic, playBack])

  const initPlayback = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    const mic = audioContext.createMediaStreamSource(stream)
    setDestination(audioContext.destination)
    setMic(mic)
  }

  return (
    <>
      <div className="bg-[url('/assets/sample.webp')] bg-no-repeat bg-cover hover:cursor-pointer z-0 absolute h-full w-full"/>
      <div className='bg-black absolute z-[5] h-full w-full opacity-60'/>
      <div className='text-3xl font-sans w-screen h-screen flex flex-row text-white z-10 relative'>
        <div className='flex-1 bg-slate-800 flex flex-col'>
          <button className='' onClick={() => changePitch(1)}>Key +</button>
          <button onClick={() => changePitch(-1)}>Key -</button>
          <button onClick={toggleVocal}>On/Off Vocal</button>
          <button onClick={togglePlayback}>On/Off Playback</button>
        </div>
        <div className="flex-[6] flex flex-col hover:cursor-pointer" onClick={togglePlay}>
          <Lrc
            lrc={lrc}
            lineRenderer={lineRenderer}
            verticalSpace
            currentMillisecond={currentMillisecond}
            recoverAutoScrollInterval={5000}
            recoverAutoScrollSingal={signal}
          />
        </div>
        
      </div>\
    </>
  )
}

export default Sing