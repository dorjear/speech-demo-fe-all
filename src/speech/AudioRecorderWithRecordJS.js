import React, { useState, useRef } from 'react';
import Recorder from 'recorder-js';
import axios from "axios";

const AudioRecorderWithRecordJS = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const recorderRef = useRef(new Recorder(audioContextRef.current));
  const streamRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const startRecordingWithAudioRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recorderRef.current.init(stream);
      recorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
    }
  };

  const stopRecordingWithAudioRecorder = async () => {
    try {
      const { blob } = await recorderRef.current.stop();
      const audioUrl = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(audioUrl);
      setIsRecording(false);
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping recording: ", err);
    }
  };

  const handleBlobUpload = async () => {
    if (!audioBlob) {
      alert('No recording available');
      return;
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await axios.post('http://localhost:5001/api/Voice/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTranscription(response.data.DisplayText || response.data.displayText || 'No transcription available');
    } catch (error) {
      console.error('Error uploading the file:', error);
      setTranscription('Error uploading the file.');
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
  }

  // return { isRecording, startRecordingWithAudioRecorder, stopRecordingWithAudioRecorder, audioBlob, audioUrl };

  return (
    <div>
      <button onClick={startRecordingWithAudioRecorder} disabled={isRecording} type="button">Start</button>
      <button onClick={stopRecordingWithAudioRecorder} disabled={!isRecording} type="button">Stop</button>
      <button onClick={handleBlobUpload} type="button">Upload Recording</button>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} type="button">Upload File</button>
      </div>
      <div>
        <h3>Transcription Result:</h3>
        <p>{transcription}</p>
      </div>
      {audioUrl && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
};

export default AudioRecorderWithRecordJS;
