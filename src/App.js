import './App.css';
import VideoSpace from './components/VideoSpace';
import { SettingsProvider } from './context/SettingsProvider';

// https://dev.to/arjhun777/video-chatting-and-screen-sharing-with-react-node-webrtc-peerjs-18fg

function App() {
  return (
    <SettingsProvider>
      <div className="App">
        <div className="prompt">
        </div>
          <VideoSpace />
      </div>
    </SettingsProvider>
 

  );
}

export default App;
