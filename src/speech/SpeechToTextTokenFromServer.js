import React, { useState } from 'react';
import { Container } from 'reactstrap';
import './custom.css'
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import Cookie from "universal-cookie";
import axios from "axios";

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

export default function App() {
  const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');
  const [player, updatePlayer] = useState({p: undefined, muted: false});

  async function getTokenOrRefresh() {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    if (speechToken === undefined) {
      try {
        const res = await axios.get('http://localhost:5001/api/Voice/get-speech-token');
        const token = res.data.token;
        const region = res.data.region;
        cookie.set('speech-token', region + ':' + token, {maxAge: 540, path: '/'});

        console.log('Token fetched from back-end: ' + token);
        return { authToken: token, region: region };
      } catch (err) {
        console.log(err.response.data);
        return { authToken: null, error: err.response.data };
      }
    } else {
      console.log('Token fetched from cookie: ' + speechToken);
      const idx = speechToken.indexOf(':');
      return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
  }

  async function sttFromMic() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    setDisplayText('speak into your microphone...');

    recognizer.recognizeOnceAsync(result => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        setDisplayText(`RECOGNIZED: Text=${result.text}`);
      } else {
        setDisplayText('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
      }
    });
  }

  async function textToSpeech() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    updatePlayer(p => {p.p = myPlayer; return p;});
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);

    let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

    const textToSpeak = 'This is an example of speech synthesis for a long passage of text. Pressing the mute button should pause/resume the audio output.';
    setDisplayText(`speaking text: ${textToSpeak}...`);
    synthesizer.speakTextAsync(
      textToSpeak,
      result => {
        let text;
        if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
          text = `synthesis finished for "${textToSpeak}".\n`
        } else if (result.reason === speechsdk.ResultReason.Canceled) {
          text = `synthesis failed. Error detail: ${result.errorDetails}.\n`
        }
        synthesizer.close();
        synthesizer = undefined;
        setDisplayText(text);
      },
      function (err) {
        setDisplayText(`Error: ${err}.\n`);

        synthesizer.close();
        synthesizer = undefined;
      });
  }

  async function handleMute() {
    updatePlayer(p => {
      if (!p.muted) {
        p.p.pause();
        return {p: p.p, muted: true};
      } else {
        p.p.resume();
        return {p: p.p, muted: false};
      }
    });
  }

  async function fileChange(event) {
    const audioFile = event.target.files[0];
    console.log(audioFile);
    const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

    setDisplayText(fileInfo);

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
      let text;
      if (result.reason === ResultReason.RecognizedSpeech) {
        text = `RECOGNIZED: Text=${result.text}`
      } else {
        text = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }

      setDisplayText(fileInfo + text);
    });
  }

  return (
    <Container className="app-container background">
      <h1 className="display-4 mb-3">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <i className="fas fa-microphone fa-lg mr-2" onClick={() => sttFromMic()}></i>
          Convert speech to text from your mic.

          <div className="mt-2">
            <label htmlFor="audio-file"><i className="fas fa-file-audio fa-lg mr-2"></i></label>
            <input
              type="file"
              id="audio-file"
              onChange={(e) => fileChange(e)}
              style={{display: "none"}}
            />
            Convert speech to text from an audio file.
          </div>
          <div className="mt-2">
            <i className="fas fa-volume-up fa-lg mr-2" onClick={() => textToSpeech()}></i>
            Convert text to speech.
          </div>
          <div className="mt-2">
            <i className="fas fa-volume-mute fa-lg mr-2" onClick={() => handleMute()}></i>
            Pause/resume text to speech output.
          </div>

        </div>
        <div className="col-6 output-display rounded">
          <code>{displayText}</code>
        </div>
      </div>
    </Container>
  );
}
