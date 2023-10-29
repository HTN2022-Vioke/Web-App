import React, { useContext, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { serverUrl } from '../utils/constants';
import { DataContext } from '../utils/context';

interface AAProps {
  setData: any
}

export const processLrc = (lrcFile: Blob) => 
  new Promise((resolve) =>  {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsText(lrcFile)
  })

export const getVocalFiles = async (name, keyShift) => {
  const data = [
    {
      name,
      has_vocal: true,
      cur_key_shift: keyShift,
    },
    {
      name,
      has_vocal: false,
      cur_key_shift: keyShift,
    },
  ]
  
  try {
    const res = await fetch(`${serverUrl}/get-audio-file`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    })
    const filePaths = await res.json()
    return filePaths
  } catch (err) {
    console.error(err)
  }
}

export const ActualApp: React.FC<AAProps> = ({ setData }) => {
  const audioInputRef = useRef(null)
  const lrcInputRef = useRef(null)
  const [selectedAudioFile, setSelectedAudioFile] = useState<any>()
  const [selectedLrcFile, setSelectedLrcFile] = useState<any>()
  const [processing, setProcessing] = useState(false)
  const history = useHistory()
  const data = useContext(DataContext)

  const audioFileUploaded = (event) => {
    setSelectedAudioFile(event.target.files[0])
  }

  const lrcFileUploaded = (event) => {
    setSelectedLrcFile(event.target.files[0])
  }

  const uploadToServer = async () => {
    setData(data => ({ ...data, lrcFile: selectedLrcFile.name }))
    const formData = new FormData()
    formData.append('file', selectedAudioFile)
    try {
      const res = await fetch(`${serverUrl}/upload-vocal`, {
        method: 'POST',
        body: formData,
      })
    } catch (err) {
      console.error(err)
    }

    const formDataLrc = new FormData()
    formDataLrc.append('file', selectedLrcFile)
    try {
      const res = await fetch(`${serverUrl}/upload-lrc`, {
        method: 'POST',
        body: formDataLrc,
      })
    } catch (err) {
      console.error(err)
    }
  }  

  const getInitAudioFiles = async () => {
    const filePaths = await getVocalFiles(selectedAudioFile.name, 0)
    setData(data => {
      return {
        ...data,
        audioUrl: filePaths[0].url,
        audioNvUrl: filePaths[1].url,
      }
    })
  }

  const proceed = async () => {
    setProcessing(true)
    await uploadToServer()
    await getInitAudioFiles()
    const lrc = await processLrc(selectedLrcFile)
    setData(data => ({ ...data, lrc }))
    setProcessing(false)
    history.push('/sing', data)
  }
  
  return (
    <div className="text-3xl font-sans bg-gradient-to-b from-slate-800 to-cyan-800 w-screen h-screen flex flex-col text-white text-left">
      <div className='mx-auto my-auto'>
        <div className='flex flex-row'>
          <div className='flex flex-col'>
            <div className='font-extralight mt-auto mb-3'>
              upload a song
            </div>
            <input type="file" name="file" className="hidden" ref={audioInputRef} onChange={audioFileUploaded} accept=".mp3,audio/*"/>
            <div className='mr-auto flex flex-row'>
              <i className="fa fa-upload hover:cursor-pointer" onClick={() => audioInputRef.current.click()}/>
              <div className='text-sm mt-auto ml-2'>{selectedAudioFile ? selectedAudioFile.name : ''}</div>
            </div>
          </div>
          <div className='flex flex-col ml-10'>
            <div className='font-extralight mt-auto mb-3'>
              upload LRC file
            </div>
            <input type="file" name="file" className="hidden" ref={lrcInputRef} onChange={lrcFileUploaded} accept=".lrc,.txt"/>
            <div className='mr-auto flex flex-row'>
              <i className="fa fa-upload hover:cursor-pointer " onClick={() => lrcInputRef.current.click()}/>
              <div className='text-sm mt-auto ml-2'>{selectedLrcFile ? selectedLrcFile.name : ''}</div>
            </div>
          </div>
        </div>
        <button className='font-light text-xl bg-slate-500 px-16 rounded-sm mt-3 w-full py-2' onClick={proceed}>
          Next
        </button>
        {processing 
        ? <div className='flex flex-row'>
            <svg className="mt-10 mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="font-light text-base mt-auto">It may take a while to process...</span>
          </div>
          : <></>
        }
        
      </div>
          
    </div>
  )
};

export default ActualApp
