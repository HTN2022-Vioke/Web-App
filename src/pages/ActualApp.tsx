import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { serverUrl } from '../utils/constants';

interface AAProps {
  setLrc: any
}

export const ActualApp: React.FC<AAProps> = ({ setLrc }) => {
  const audioInputRef = useRef(null)
  const lrcInputRef = useRef(null)
  const [selectedAudioFile, setSelectedAudioFile] = useState<any>()
  const [selectLrcFile, setSelectedLrcFile] = useState<any>()
  const history = useHistory()

  const audioFileUploaded = (event) => {
    setSelectedAudioFile(event.target.files[0])
  }

  const lrcFileUploaded = (event) => {
    setSelectedLrcFile(event.target.files[0])
  }

  const uploadToServer = async () => {
    const formData = new FormData()
    formData.append('File', selectedAudioFile)
    try {
      const res = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      
    } catch (err) {
      console.error(err)
    }

  }

  const processLrc = async () => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result
      setLrc(content)
    }
    reader.readAsText(selectLrcFile)
  }

  const proceed = async () => {
    // uploadToServer()
    processLrc()
    history.push('/sing')
  }
  
  return (
    <div className="text-3xl font-sans bg-gradient-to-b from-slate-800 to-cyan-800 w-screen h-screen flex flex-col text-white text-left">
      <div className='mx-auto my-auto'>
        <div className='font-extralight mt-auto mb-3'>
          Upload a song
        </div>
        <input type="file" name="file" className="hidden" ref={audioInputRef} onChange={audioFileUploaded} accept=".mp3,audio/*"/>
        <div className='mx-auto flex flex-row'>
          <i className="fa fa-upload hover:cursor-pointer " onClick={() => audioInputRef.current.click()}/>
          <div className='text-sm mt-auto ml-2'>{selectedAudioFile ? selectedAudioFile.name : ''}</div>
        </div>
        <div className='font-extralight mt-auto mb-3'>
          Upload LRC file
        </div>
        <input type="file" name="file" className="hidden" ref={lrcInputRef} onChange={lrcFileUploaded} accept=".lrc,.txt"/>
        <div className='mx-auto flex flex-row'>
          <i className="fa fa-upload hover:cursor-pointer " onClick={() => lrcInputRef.current.click()}/>
          <div className='text-sm mt-auto ml-2'>{selectLrcFile ? selectLrcFile.name : ''}</div>
        </div>
        <button className='font-light text-lg bg-slate-500 px-16 rounded-sm mt-3' onClick={proceed}>
          Next
        </button>
      </div>
    </div>
  )
};

export default ActualApp
