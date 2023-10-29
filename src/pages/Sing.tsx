import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Lrc, LrcLine, useRecoverAutoScrollImmediately } from 'react-lrc'
import { useHistory } from 'react-router'
import { serverUrl } from '../utils/constants'
import { DataContext } from '../utils/context'
import { getVocalFiles } from './ActualApp'

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

interface SingProps {
  setData: any
}

interface SessionData {
  uuid: string
  audio: {
    uuid: string
    name: string
    lrcFile: string
  }
  timestamp: number
  curKeyShift: number
  hasVocal: boolean
}

export const Sing: React.FC<SingProps> = ({ setData }) => {
  const [play, setPlay] = useState(false)
  const [playBack, setPlayBack] = useState(false)
  const [hasVocal, setHasVocal] = useState(false)
  const [curTrack, setCurTrack] = useState<string>('')
  const [destination, setDestination] = useState<AudioDestinationNode>(null)
  const [mic, setMic] = useState<MediaStreamAudioSourceNode>(null)
  const [curKey, setKey] = useState(0)
  const [adjustKey, setAdjustKey] = useState(curKey)
  const [curTime, setCurTime] = useState(0)
  const data = useContext(DataContext)
  const [audioUrl, setAudioUrl] = useState(data.audioUrl)
  const [audioNvUrl, setAudioNvUrl] = useState(data.audioNvUrl)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [shouldSave, setShouldSave] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const history = useHistory()

  const {
    signal,
  } = useRecoverAutoScrollImmediately()

  const lineRenderer = useCallback(
    ({ active, line: { content } }: { active: boolean; line: LrcLine }) => (
      <Line active={active} content={content}/>
    ),
    []
  )

  const keyShift = async () => {
    try {
      const fileUrls = await getVocalFiles(sessionData.audio.name, adjustKey)
      setAudioUrl(fileUrls[0].url)
      setAudioNvUrl(fileUrls[1].url)
    } catch (err) {
      console.error(err)
    }

    setKey(adjustKey)
  }

  const updateSessionAPI = (updateData) =>
    fetch(`${serverUrl}/session`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include',
    })

  const updateSession = async (sessionData) => {
    console.log('update session', sessionData)
    const updateData = {
      uuid: sessionData.uuid,
      audio: {
        uuid: sessionData.audio.uuid,
        name: data.audioUrl,
        lrc_file: data.lrcFile,
      },
      timestamp: curTime ?? 0,
      cur_key_shift: curKey ?? 0,
      has_vocal: hasVocal ?? false,
    }
    try {
      await updateSessionAPI(updateData)
    } catch (err) {
      console.error(err)
    }
  }

  const clearSession = async (sessionData) => {
    const updateData = {
      uuid: sessionData.uuid,
      audio: {
        uuid: sessionData.audio.uuid,
        name: '',
        lrc_file: '',
      },
      timestamp: 0,
      cur_key_shift: 0,
      has_vocal: false,
    }
    try {
      await updateSessionAPI(updateData)
    } catch (err) {
      console.error(err)
    }
  }
  
  const getSession = async () => {
    const resp = await fetch(`${serverUrl}/session`, {
      method: 'GET',
      credentials: 'include',
    })
    if (resp.status === 404) return null
    const sessionData = await resp.json()
    console.log('data', sessionData)
    return sessionData
  }

  const createSession = async (): Promise<SessionData> => {
    const resp = await fetch(`${serverUrl}/session`, {
      method: 'POST', 
      headers: {
        'Accept': '*/*',
      },
      credentials: 'include',
    })
    const sessionData = await resp.json()
    
    await updateSession({ ...sessionData })
    return sessionData
  }

  const initLrc = async (file: string) => {
    const resp = await fetch(`${serverUrl}/files/${file}`, {
      method: 'GET',
    })
    const lrc = await resp.text()
    setData(data => ({ ...data, lrc }))
  }

  const initSession = async () => {
    let sessionData = await getSession()
    if (sessionData === null) {
      setSessionData(await createSession())
    } else {
      setSessionData({ ...sessionData })
      setKey(sessionData.curKeyShift)
      setAdjustKey(Number(sessionData.curKeyShift))
      setCurTime(Number(sessionData.timestamp))
      if (audioUrl === '') {
        console.log('???')
        const filePaths = await getVocalFiles(sessionData.audio.name, 0)
        // setData(data => {
        //   return {
        //     ...data,
        //     audioUrl: filePaths[0].url,
        //     audioNvUrl: filePaths[1].url,
        //   }
        // })
        setAudioUrl(filePaths[0].url)
        setAudioNvUrl(filePaths[1].url)
        setHasVocal(sessionData.hasVocal === 'True')
      }
      if (sessionData.audio.lrcFile) {
        setData(data => ({ ...data, lrcFile: sessionData.audio.lrcFile }))
        await initLrc(sessionData.audio.lrcFile)
      }
    }
  }

  useEffect(() => {
    if (hasVocal) {
      setCurTrack(audioUrl)
    } else {
      setCurTrack(audioNvUrl)
    }
  }, [audioUrl, audioNvUrl])

  const toggleVocal = async () => {
    setHasVocal(vocal => !vocal)
  }

  useEffect(() => {
    setCurTrack(hasVocal ? audioUrl : audioNvUrl)
  }, [hasVocal])

  useEffect(() => {
    if (!play) return
    (async () => {
      if (audioRef.current) {
        audioRef.current.currentTime = curTime
        await audioRef.current.play()
      }
    })()
  }, [curTrack])

  useEffect(() => {
    if (audioRef.current === null) return
    audioRef.current.addEventListener('play', () => setPlay(true))
    audioRef.current.addEventListener('pause', () => setPlay(false))
  }, [audioRef])

  useEffect(() => {
    if (audioRef.current === null) return
    audioRef.current.currentTime = curTime
    const updateCurTime = () => {
      setCurTime(audioRef.current.currentTime)
    }
    audioRef.current.addEventListener('timeupdate',updateCurTime)
    return () => {
      audioRef.current.removeEventListener('timeupdate', updateCurTime)
    }
  }, [audioRef.current])

  const togglePlayback = () => {
    setPlayBack((playback) => !playback)
  }

  const togglePlay = () => {
    setPlay((play) => {
      if (play) {
        audioRef.current.pause()
        return false
      }
      audioRef.current.play()
      return true
    })
  }

  useEffect(() => {
    const updateSessionData = (e) => { 
      if (shouldSave) updateSession(sessionData)
    }
    window.addEventListener('beforeunload', updateSessionData)
    return () => {
      window.removeEventListener('beforeunload', updateSessionData)
    }
  }, [sessionData, curTime, curKey, hasVocal, audioUrl, audioNvUrl, data])

  useEffect(() => {
    initPlayback()
    initSession()
    if (data) {
      setAudioUrl(data.audioUrl)
      setAudioNvUrl(data.audioNvUrl)
      setCurTrack(data.audioNvUrl)
    }
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }})
    const audioContext = new AudioContext({
      latencyHint: 'playback',
    })
    const mic = audioContext.createMediaStreamSource(stream)
    setDestination(audioContext.destination)
    setMic(mic)
  }

  const newSong = async () => {
    setShouldSave(false)
    await clearSession(sessionData)
    history.push('/app')
  }

  if (!curTrack || !data.lrc) {
    console.log(data)
    return (
      <div>
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="bg-[url('/assets/sample.webp')] bg-no-repeat bg-cover hover:cursor-pointer z-0 absolute h-full w-full"/>
      <div className='bg-black absolute z-[5] h-full w-full opacity-60'/>
      <div className='text-3xl font-sans w-screen h-screen flex flex-row text-white z-10 relative'>
        <div className='flex-1 bg-gradient-to-b from-slate-800 to-cyan-800 flex flex-col text-base text-center px-2 py-4'>
          <div>Key change (semitones): {curKey > 0 ? `+${curKey}` : curKey} </div>
          <div>Modification: {adjustKey > 0 ? `+${adjustKey}` : adjustKey} </div>
          <div className='flex flex-row  align-middle my-1'>
            <button className='p-auto border flex-1 rounded-tl rounded-bl' onClick={() => setAdjustKey(key => key - 1)}>key -</button>
            <button className='p-auto border flex-1 rounded-tr rounded-br' onClick={() => setAdjustKey(key => key + 1)}>key +</button>
          </div>
          <button className='p-auto border rounded' onClick={keyShift}>Apply</button>
          <div className='mt-5'>Vocal: {hasVocal ? 'enabled' : 'disabled'}</div>
          <button onClick={toggleVocal} className='p-auto border my-1 rounded'>{hasVocal ? 'Disable vocal' : 'Enable vocal'}</button>
          <div className='mt-5'>Playback: {playBack ? 'enabled' : 'disabled'}</div>
          <button onClick={togglePlayback} className='p-auto border my-1 rounded'>{playBack ? 'Disable playback' : 'Enable playback'}</button>

          <button onClick={newSong} className='p-auto border mt-auto rounded py-4 mb-3'>New song</button>
        </div>
        <div className="flex-[6] flex flex-col hover:cursor-pointer" onClick={togglePlay}>
          <Lrc
            lrc={data.lrc}
            lineRenderer={lineRenderer}
            verticalSpace
            currentMillisecond={curTime * 1000}
            recoverAutoScrollInterval={5000}
            recoverAutoScrollSingal={signal}
          />
        <audio controls className='w-full h-40 mt-auto' ref={audioRef} src={`${serverUrl}/files/${curTrack}`} />
        </div>
      </div>
    </>
  )
}

export default Sing
