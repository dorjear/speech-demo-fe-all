import React, { useState, useRef } from 'react';

function AudioRecorderWithMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mediaStream = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.current = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      setIsRecording(false);
      handleStop();
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
    setAudioBlob(blob);
    chunksRef.current = [];
  };

  const sendAudioToServer = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:5001/api/Voice/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Audio uploaded successfully');
      } else {
        console.error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  return (
    <div>
      <div>
        <p>This is using navigator.mediaDevices and MediaRecorder</p>
      </div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioBlob && (
        <button onClick={sendAudioToServer}>Send to Server</button>
      )}
    </div>
  );
}

export default AudioRecorderWithMediaRecorder;
