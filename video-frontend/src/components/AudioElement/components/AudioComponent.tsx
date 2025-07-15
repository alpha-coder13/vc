import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import {useAudioIn, useAudioOut} from '../hooks/useAudio';

interface AudioPlayerProps{
      RTCPeerConnection:React.RefObject< RTCPeerConnection> ,
        MediaStreamSent:React.RefObject<MediaStream>
      
}

const AudioComponent:React.FC<AudioPlayerProps> = ({RTCPeerConnection , MediaStreamSent}:AudioPlayerProps) => {
  const audioIn = useAudioIn({RTCPeerConnection, MediaStreamSent});
  const audioOut = useAudioOut({RTCPeerConnection, audioIn});

  const [isMuted, setMuted] =  useState(false);

  const toggleMute = () => {
        setMuted((prev) => {
                if(RTCPeerConnection.current){
                    const senders = RTCPeerConnection.current?.getSenders()
                        for(let tracks of senders){
                            if(tracks.track?.id == audioIn?.id){
                                const tracklocal = tracks.track;
                                tracklocal.enabled = !tracklocal.enabled
                                tracks.replaceTrack(tracklocal).then(()=>{
                                    console.log('track replaced sucessfully');
                                }).catch(e=>
                                    console.log(e)
                                )
                            }
                        }
                }            
            return !prev;
        });
    }



        // useEffect(()=>{
            
        //     const audioContexts:AudioContext[] = []; 
        //     [...audioOut.entries()].map(([val1,val2]) => {
        //         const audioTrackArray = val2.getAudioTracks(); // removing echo 
        //         if(audioTrackArray.length == 0)return;
        //         const removingSameMediaStream = new MediaStream();
        //         audioTrackArray.forEach((val)=>{
        //             if(val.id !== audioIn?.id){
        //                 removingSameMediaStream.addTrack(val);
        //             }
        //         })
        //         const newAudioContext =  new AudioContext();
        //         const track = newAudioContext.createMediaStreamSource(removingSameMediaStream);
        //         track.connect(newAudioContext.destination);
        //         audioContexts.push(newAudioContext);
        //     });
            
        //     return () => { // return fucntion handles performance issues
        //         audioContexts.forEach(ctx => {
        //             ctx.close();
        //         });
        //     };
        // },[audioOut, audioIn?.id])


  return (
    <div className="flex items-center justify-center  fixed z-10 bottom-1 left-2/5 ">
      <div className="text-center">
        <button
          onClick={toggleMute}
          className={`
            overflow-hidden
            w-24 h-16 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-opacity-50
            shadow-lg hover:shadow-xl
            ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white'
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white'
            }
          `}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            {isMuted ? (
              <MicOff size={24} className="animate-pulse" />
            ) : (
              <Mic size={24} />
            )}
          </div>
          
          {/* Animated border for muted state */}
          {isMuted && (
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
          )}
        </button>
      </div>

    </div>
  );
}

export default AudioComponent;