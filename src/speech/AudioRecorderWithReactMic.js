import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const AudioRecorderWithReactMic = () => {
  const [recording, setRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcription, setTranscription] = useState('');

  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const onStop = async (recordedBlob) => {
    console.log('Recorded Blob: ', recordedBlob);
    if (recordedBlob && recordedBlob.blob) {
      const formData = new FormData();
      formData.append('file', recordedBlob.blob, 'recording.wav');

      try {
        const response = await axios.post('http://localhost:5001/api/Voice/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        var text = response.data.DisplayText || response.data.displayText || 'No transcription available'
        console.log("text is " + text)
        setTranscription(text);
        console.log('Transcription: ', response.data);
      } catch (error) {
        console.error('Error uploading the file:', error);
        setTranscription('Error uploading the file.');      }
    } else {
      console.error('Recorded blob is empty or invalid');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5001/api/Voice/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Transcription: ', response.data);
      setTranscription(response.data.DisplayText || response.data.displayText || 'No transcription available');
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
  };

  return (
    <div>
      <div>
        <ReactMic
          record={recording}
          className="sound-wave"
          onStop={onStop}
          mimeType="audio/wav"
        />
      </div>
      <div>
        <button onClick={startRecording} type="button">Start</button>
        <button onClick={stopRecording} type="button">Stop</button>
      </div>
      <div></div>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} type="button">Upload File</button>
      </div>
      <div>
        <h3>Transcription Result:</h3>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default AudioRecorderWithReactMic;
