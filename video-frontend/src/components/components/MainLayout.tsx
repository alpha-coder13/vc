
import React from 'react';
import VideoPlayer from './VideoPlayer';
import ChatBox from './ChatBox';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
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
          <VideoPlayer title="Remote Participant" />
          <VideoPlayer title="Local Preview" />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full">
          <ChatBox />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
