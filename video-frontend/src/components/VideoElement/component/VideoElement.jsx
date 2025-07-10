import React, { useEffect, useRef } from "react";
import useVideo from "../hooks/useVideo";
import useRTC from "../../RTC/hooks";

const VideoElement = ({height ='480', width = '640', classname=''}) =>{

    const video = useVideo(height,width);
    const videoElementRef = useRef(null);
    const videoElementStreamRef = useRef(null);
    const {makeCall, hangup,connectionState,RTCConnection} = useRTC(); 

    useEffect(()=>{
        if(video && RTCConnection?.current){
            video.then((stream)=>{
                if(videoElementRef.current){
                    videoElementRef.current.srcObject = stream;
                    videoElementRef.current.play().catch(console.error);
                     stream.getTracks().forEach(track => {
                    RTCConnection.current.addTrack(track, stream);
                });
                    console.log(stream);
                }
            }).catch(console.error);
        }
    },[video, RTCConnection])

    useEffect(()=>{
        if(RTCConnection?.current){
            RTCConnection.current.addEventListener('track',(e)=>{
                console.log("track found")
                if(videoElementStreamRef.current){
                    console.log(e.streams);
                    videoElementStreamRef.current.srcObject = e.streams[0];
                    videoElementStreamRef.current.play().catch(console.error);
                }
            })
        }

    },[RTCConnection])
    return(
        <>
            <div>{connectionState}</div>
            <video ref={videoElementRef} className={classname} height={height} width={width} style={{transform:"rotateY(180deg)"}} autoPlay muted playsInline></video>
            <video ref={videoElementStreamRef} className={classname} height={height} width={width} style={{transform:"rotateY(180deg)"}} autoPlay muted playsInline></video>
            <button onClick={makeCall}> callRTC button</button>
            <button onClick={hangup}> hangup button</button>
        </>
    )
}

export default VideoElement;