import React, { useEffect, useRef, useState } from "react";

interface AudioProps {
    RTCPeerConnection:React.RefObject< RTCPeerConnection> ,
    MediaStreamSent:React.RefObject<MediaStream>
    
}

const useAudioIn = ({RTCPeerConnection ,MediaStreamSent} :AudioProps) =>{
    const [audioStream, setAudioStream] = useState<MediaStreamTrack | null>(null);
    const config = {
        audio : true,
    }
    useEffect(()=>{
        if(window){
            const Navigator = window.navigator;
            navigator.mediaDevices.getUserMedia(config).then((stream) => { 
                const primaryAudioTrack = stream.getAudioTracks()[0];
                if(RTCPeerConnection.current && MediaStreamSent.current){
                    MediaStreamSent.current.addTrack(primaryAudioTrack);
                    RTCPeerConnection.current?.addTrack(primaryAudioTrack, MediaStreamSent.current);
                }
                setAudioStream(primaryAudioTrack);
            }).catch((err)=>{
                console.log(err)
            });
        }
    },[RTCPeerConnection.current, MediaStreamSent.current]);

    return audioStream ;
}


interface AudioOutProps {
    RTCPeerConnection:React.RefObject< RTCPeerConnection> ,
    SelfMediaTrack: MediaStreamTrack | null,
    
}

const useAudioOut = ({RTCPeerConnection,SelfMediaTrack} :AudioOutProps)=>{
  const audioOutputStream = useRef<AudioContext[]>([])
    useEffect(()=>{
        // const audioContexts:AudioContext[] = []; 
        if(RTCPeerConnection.current){
        RTCPeerConnection.current.addEventListener('track',(e :RTCTrackEvent)=>{
            console.log(e)
            const {streams}  = e;
            for(let stream of streams){
                if(stream.getAudioTracks().length > 0){
                    stream.getAudioTracks()[0].onmute = console.log;
                    if(stream.getAudioTracks()[0].id == SelfMediaTrack)return;
                          const newAudioContext =  new AudioContext();
                          const track = newAudioContext.createMediaStreamSource(stream);
                          track.connect(newAudioContext.destination);
                          audioOutputStream.current.push(newAudioContext);
                }
            } 
        })}

        return () => { // return fucntion handles performance issues
            audioOutputStream.current.forEach(ctx => {
                ctx.close();
            });
             audioOutputStream.current = [];
        };
    },[RTCPeerConnection.current,SelfMediaTrack])
    // return audioOutputStream
}

export {useAudioIn,useAudioOut} ;