import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const useRTC = (videoSourceRef) => {
    const config = {
        "iceServers": [
            // {
            //     "urls": "stun:stun.l.google.com:19302"
            // }
            // ,
            {
                "username": "1751897080209:kraT0s",
                "credential": "3eaWHipwNR2UDW1ipGvUvcvQL4Y=",
                "urls": [
                    "turn:128.199.26.238:10000?transport=tcp",
                    "turn:128.199.26.238:11000?transport=udp"
                ]
            },
        ]
    }
    const Signalling = useRef(io("wss://vc-service.onrender.com/",{
        autoConnect:false,
    }));


    const RTCConnection = useRef();
    const [connectionState, setConnectionState] = useState("new");
    const [signalingState , setSignallingState]  = useState("");
    const [error, setError] = useState({
        message: "",
        showErrorClassname:"d-none",
    })
    const MediaStreamSent = useRef(new MediaStream());
    useEffect(()=>{

        if(Signalling.current && connectionState == 'disconnected' ){
            Signalling.current.disconnect();
        }
    },[connectionState])

    useEffect(() => {
        const rtcConnection = new RTCPeerConnection(config);
        RTCConnection.current =rtcConnection;

        RTCConnection.current.onconnectionstatechange = (e)=>{
            setConnectionState(rtcConnection.connectionState);
            console.log("Current Connection State :", rtcConnection.connectionState);
        }

        RTCConnection.current.onsignalingstatechange = (e) =>{
            setSignallingState(rtcConnection.signalingState);
            console.log("Current Signalling State :", rtcConnection.signalingState);
        }

        RTCConnection.current.onicecandidate = (event) => {
            if(event.candidate){
                console.log(event);
                Signalling.current.emit('iceCandidate', event.candidate)
            }
        } 

        // rtcConnection.addEventListener('track',(e)=>{
        //     videoSourceRef.srcObject=e.streams[0];
        // })

        Signalling.current.on('message',async(data)=>{
            try{
                // if(RTCConnection.current.signalingState !=='stable'){
                    if(data.answer){
                //   console.log("Answer packet received :", data.answer);
                    const remoteDesc = new RTCSessionDescription(data.answer);
                    await RTCConnection.current.setRemoteDescription(remoteDesc);
                //   console.log("Answer packet successfully set");/
                    return;
                     }
                    if(data.offer){
                        // console.log("offer packet received :", data.offer);
                        const remoteDesc = new RTCSessionDescription(data.offer);
                        await RTCConnection.current.setRemoteDescription(remoteDesc);
                        // console.log("remote desc offer packet set");
                        const answer = await rtcConnection.createAnswer();
                        await RTCConnection.current.setLocalDescription(answer);
                        // console.log("local desc answer packet set");
                        Signalling.current.emit('sendAnswer',{'answer':answer});
                        // console.log("local desc answer packet sent");
                        return;
                    }
                    // console.log(data);
                    if(data.iceCandidate){
                        
                        await RTCConnection.current.addIceCandidate(data.iceCandidate);
                        // console.log("Ice candidates added");
                    }
                // }
                
            }catch(error){
                console.log("Error: ", error.message);
            }
        }) 
        
        
        Signalling.current.on('error',async(data)=>{
            console.log(data);
              setError({
                message : data.message,
                showErrorClassname:1
              })
        })

        return ()=>{
            RTCConnection.current?.close();
            Signalling.current?.disconnect();
        }

    }, [])

    async function makeCall(RoomID){
        if(!RTCConnection.current || !Signalling.current){
            console.log("not initialized yet");
            return ;
        }

        if(RoomID){
            Signalling.current.connect();
            Signalling.current.emit('joinRoom',{RoomID});
            if(RTCConnection.current.signalingState !== 'stable'){
                console.log('Cannot create offer in current state:', RTCConnection.current.signalingState);
                return;
            }
            const offer = await RTCConnection.current.createOffer();
            RTCConnection.current.setLocalDescription(offer);
            Signalling.current.emit('sendOffer',{'offer': offer});
        }   
        
    }

    const hangup = () => {
        if (RTCConnection.current) {
            RTCConnection.current.close();
        }

    };

    return {makeCall, hangup, connectionState, RTCConnection, MediaStreamSent, Signalling,error}
}


export default useRTC