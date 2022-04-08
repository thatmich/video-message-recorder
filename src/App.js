import './App.css';
import VideoSpace from './components/VideoSpace';
import { SettingsProvider } from './context/SettingsProvider';

// https://dev.to/arjhun777/video-chatting-and-screen-sharing-with-react-node-webrtc-peerjs-18fg

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <div className="description">
          <h1>
            Video
            Recorder
          </h1>
          <p>
            Record your screen, camera, and microphone in one webpage.
          </p>
          <p>
            Able to record your screen and camera at the same time, without having to download anything.
          </p>
          <p>
            <span id="span-space">
              Please feel free to send questions or comments to this project's
              <a href="https://github.com/thatmich/video-message-recorder/issues"> Github page</a>
              .
            </span>
          </p>
        </div>
        <div className="prompts">
          <VideoSpace />
        </div>
      </div>
    </SettingsProvider>


  );
}

export default App;
