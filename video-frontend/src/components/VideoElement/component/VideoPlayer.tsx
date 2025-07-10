
import React, { useEffect, useRef, useState } from 'react';
import useVideo from '../hooks/useVideo';

interface VideoPlayerProps {
  RTCConnection:React.RefObject< RTCPeerConnection> ,
  mode :string | undefined, 
  connectionState:null | string,
}

interface VideoStream{
    stream : Promise<MediaStream>,
}

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);


const VideoPlayer: React.FC<VideoPlayerProps> = ({ RTCConnection, mode, connectionState }) => {

  const video : VideoStream = useVideo();
  const [streamState, setStreamState] = useState<Boolean>(false); 
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [incomingMediaStream, setIncomingMediaStream] = useState<MediaStream>(null); 

  // const videoElementStreamRef= useRef<Document | null>(null);
      useEffect(()=>{
              if(video.stream && RTCConnection.current && mode == 'local'){
                video.stream.then((stream)=>{
                setStreamState(true);
                    if(videoElementRef.current){
                        videoElementRef.current.srcObject = stream;
                        videoElementRef.current.play().catch(console.error);
                        stream.getTracks().forEach((track:MediaStreamTrack) => {
                          console.log(track)
                            RTCConnection.current.addTrack(track, stream);
                    });
                        console.log(stream);
                    }
                }).catch(console.error);
               }
             else if(RTCConnection.current && mode == 'Remote'){
                RTCConnection.current.addEventListener('track',(e)=>{
                    setStreamState(true);
                    setIncomingMediaStream(e.streams[0]);
                })
              }
      },[video.stream,RTCConnection, mode])

      useEffect(()=>{
            if(videoElementRef.current && mode == 'Remote' && connectionState == "connected"){
                    videoElementRef.current.srcObject = incomingMediaStream;
                    videoElementRef.current.play().catch(console.error);
            }
      },[mode, connectionState])
  

  if(mode == 'Remote' && connectionState !== "connected")return <></>;

  return ( 
    <div className="relative flex-1 bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">

        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
       {!streamState &&
        <div className="text-center z-10">
            <UserIcon/>
        </div> }
        <video ref={videoElementRef} className="absolute inset-0 bg-slate-800 flex items-center justify-center h-full w-full"  style={{transform:"rotateY(180deg)"}} autoPlay muted playsInline></video>
      </div>

    </div>
  );
};

export default VideoPlayer;
