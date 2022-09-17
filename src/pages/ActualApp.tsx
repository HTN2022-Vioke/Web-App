import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { serverUrl } from '../utils/constants';

export const ActualApp: React.FC = () => {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState<any>()
  const history = useHistory()
    
  const uploadPopup = () => {
    inputRef.current.click()
  }

  const fileUploaded = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const uploadToServer = async () => {
    const formData = new FormData()
    formData.append('File', selectedFile)
    try {
      const res = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      history.push('/sing')
    } catch (err) {
      console.error(err)
    }

  }
  
  return (
    <div className="text-3xl font-sans bg-gradient-to-b from-slate-800 to-cyan-800 w-screen h-screen flex flex-col text-white text-left">
      <div className='mx-auto my-auto'>
        <div className='font-extralight mt-auto mb-3'>
          Upload a song
        </div>
        <input type="file" name="file" className="hidden" ref={inputRef} onChange={fileUploaded} accept=".mp3,audio/*"/>
        <div className='mx-auto flex flex-row'>
          <i className="fa fa-upload hover:cursor-pointer " onClick={uploadPopup}/>
          <div className='text-sm mt-auto ml-2'>{selectedFile ? selectedFile.name : ''}</div>
        </div>
        <button className='font-light text-lg bg-slate-500 px-16 rounded-sm mt-3' onClick={uploadToServer}>
          Next
        </button>
      </div>
    </div>
  )
};

export default ActualApp
