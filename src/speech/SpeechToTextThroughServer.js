import AudioRecorderWithRecordJS from './AudioRecorderWithRecordJS';
import AudioRecorderWithMediaRecorder from './AudioRecorderWithMediaRecorder.js';
import AudioRecorderWithReactMic from "./AudioRecorderWithReactMic";

const SpeechToTextThroughServer = () => {
  return (
    <div>
      <div>
        <h1>=======================</h1>
        <h2>Audio Recorder with ReactMic</h2>
        <AudioRecorderWithReactMic/>
      </div>

      <div>
        <h1>=======================</h1>
        <h2>Audio Recorder with recorder-js</h2>
        <AudioRecorderWithRecordJS/>
      </div>

      <div>
        <div className="App">
          <h1>=======================</h1>
          <h2>Audio Recorder with MediaRecorder</h2>
          <AudioRecorderWithMediaRecorder />
        </div>
      </div>

    </div>
  );
};

export default SpeechToTextThroughServer;
