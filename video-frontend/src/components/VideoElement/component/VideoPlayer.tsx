
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import useVideo from '../hooks/useVideo';

interface VideoPlayerProps {
  RTCConnection:React.RefObject< RTCPeerConnection> ,
  mode :string | undefined, 
  connectionState:null | string,
  children:any,
  MediaStreamSent:React.RefObject<MediaStream> | undefined
  
}

interface VideoStream{
    stream : Promise<MediaStream>,
}

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);


const VideoPlayer: React.FC<VideoPlayerProps> = ({ RTCConnection, mode, connectionState,children, MediaStreamSent }) => {

  const video : VideoStream = useVideo();
  const [streamState, setStreamState] = useState<Boolean>(false); 
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [incomingMediaStream, setIncomingMediaStream] = useState<MediaStream>(null); 

  // const videoElementStreamRef= useRef<Document | null>(null);
      useEffect(()=>{
              if(video.stream && RTCConnection.current && mode == 'local'){
                video.stream.then((stream)=>{
                setStreamState(true);
                const videoTrack = stream.getVideoTracks()[0]
                console.log("video stream" , stream);
                    if(videoElementRef.current && MediaStreamSent.current){
                        videoElementRef.current.srcObject = stream;
                        videoElementRef.current.play().catch(console.error);
                        MediaStreamSent?.current.addTrack(videoTrack);
                        RTCConnection.current.addTrack(videoTrack,MediaStreamSent.current);
                        console.log(stream);
                    }
                }).catch(console.error);
               }
             else if(RTCConnection.current && mode == 'Remote'){
                RTCConnection.current.addEventListener('track',(e)=>{
                    setStreamState(true);
                    const {streams} = e;
                    if(streams.length !=0){
                      for(let stream of streams ){
                        if(stream.getVideoTracks().length > 0){
                         setIncomingMediaStream(stream);
                         break;
                        }
                      }
                    }else{
                      // const createVideoStream()
                    }
                    
                })
              }
      },[video.stream,RTCConnection, mode,MediaStreamSent])

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
        {children}
    </div>
  );
};

export default VideoPlayer;
