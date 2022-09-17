import {useEffect, useState, useCallback} from 'react'

function useTimer(speed = 1) {
  const [paused, setPaused] = useState(true)
  const play = useCallback(() => setPaused(false), [])
  const pause = useCallback(() => setPaused(true), [])

  const [currentMillisecond, setCurrentMillisecond] = useState(0)
  const reset = useCallback(() => setCurrentMillisecond(0), [])

  useEffect(() => {
    if (!paused) {
      let last = Date.now()
      const timer = window.setInterval(() => {
        const now = Date.now()
        setCurrentMillisecond((cm) => cm + (now - last) * speed)
        last = now
      }, 97)
      return () => window.clearInterval(timer)
    }
  }, [paused, speed])

  return {
    currentMillisecond,
    setCurrentMillisecond,
    reset,
    paused,
    play,
    pause,
  }
}

export default useTimer
