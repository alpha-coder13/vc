
import React from 'react';

interface VideoPlayerProps {
  title: string;
}

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);


const VideoPlayer: React.FC<VideoPlayerProps> = ({ title }) => {
  return (
    <div className="relative flex-1 bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
        <div className="text-center">
            <UserIcon/>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-50 rounded-tr-lg">
        <p className="text-sm text-white font-medium">{title}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
