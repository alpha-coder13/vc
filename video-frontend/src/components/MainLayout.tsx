
import React from 'react';
import VideoPlayer from './VideoElement/component/VideoPlayer';
import ChatBox from './ChatBox';
import useRTC from './RTC/hooks';
import AudioComponent from './AudioElement/components/AudioComponent';

interface MainLayoutProps {
  onLogout: () => void;
}



// --- Style Notes ---
// These classes would be defined in your CSS file to match the dark theme.
// .pre-join-container { display: flex; flex-direction: column; ... }
// .device-controls button { background: #4A5568; ... }
// .join-button { background: #3B82F6; ... }
// .settings-link { color: #9CA3AF; ... }

const JoinLobby = ({ onJoin }) => {
  return (
    <div className="pre-join-container">
      <button className="join-button" onClick={onJoin}>
        Join Now
      </button>
    </div>
  );
};


const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {


  const {makeCall, hangup, connectionState,RTCConnection} = useRTC();
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <h1 className="text-xl font-bold text-white">Video Conference</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
          <VideoPlayer  RTCConnection={RTCConnection} mode={"Remote"} connectionState={connectionState}><></></VideoPlayer>
          <VideoPlayer  RTCConnection={RTCConnection} mode={"local"} connectionState={null}>
            <AudioComponent RTCPeerConnection={RTCConnection}/>
          </VideoPlayer>
        </div>
        <div className="lg:col-span-1 flex flex-col h-full">
          {connectionState == 'connected' && <ChatBox />}
          {connectionState !== 'connected' && <JoinLobby onJoin={makeCall}/>}
        </div> 
      </main>
    </div>
  );
};

export default MainLayout;
