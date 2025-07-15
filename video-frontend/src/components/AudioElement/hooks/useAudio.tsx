import React, { useEffect, useState } from "react";

interface AudioProps {
          RTCPeerConnection:React.RefObject< RTCPeerConnection> ,
    
}

const useAudioIn = ({RTCPeerConnection} :AudioProps) =>{
    const [audioStream, setAudioStream] = useState<MediaStreamTrack | null>(null);
    const config = {
        audio : true,
    }
    useEffect(()=>{
        if(window){
            const Navigator = window.navigator;
            navigator.mediaDevices.getUserMedia(config).then((stream) => { 
                const primaryAudioTrack = stream.getAudioTracks()[0];
                RTCPeerConnection.current?.addTrack(primaryAudioTrack,stream);
                // primaryAudioTrack.onmute = () => {
                //     console.log('called');
                //     const senders = RTCPeerConnection.current?.getSenders()
                //     for(let tracks of senders){
                //         if(tracks.track?.id == primaryAudioTrack.id){
                //             tracks.replaceTrack(null);
                //         }
                //     }
                // } 
                // primaryAudioTrack.onunmute = () => {
                //     console.log('called unmute')
                //     RTCPeerConnection.current?.addTrack(primaryAudioTrack, stream)
                // }
                setAudioStream(primaryAudioTrack);
            }).catch((err)=>{
                console.log(err)
            });
        }
    },[RTCPeerConnection.current]);

    return audioStream ;
}


const useAudioOut = ({RTCPeerConnection} :AudioProps)=>{
  const [audioOutputStream, setAudioOutputStream] = useState<Set<MediaStream>>(new Set())
    useEffect(()=>{
        RTCPeerConnection.current?.addEventListener('track',(e :RTCTrackEvent)=>{
            const {streams}  = e;
            for(let stream of streams){
                if(stream.getAudioTracks().length > 0){
                    if(!audioOutputStream.has(stream)){
                        const newSet:Set<MediaStream> = new Set();
                        audioOutputStream.forEach(val => newSet.add(val));
                        newSet.add(stream);
                        setAudioOutputStream(newSet);
                    }
                }
            } 
        })
    },[RTCPeerConnection.current,audioOutputStream])
    return audioOutputStream
}

export {useAudioIn,useAudioOut} ;