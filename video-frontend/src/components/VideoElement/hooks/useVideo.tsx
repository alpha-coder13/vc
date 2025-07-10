import { useEffect, useState } from "react"
interface VideoStream{
    stream : Promise<MediaStream>,
}
const useVideo:Function = ()=>{

    const [videoStream , setVideoStream] = useState<VideoStream | null>(null);
    
    useEffect(()=>{
        if(window){
            const Navigator =  window.navigator; 
            const userMediaObject = {
                video:{
                    height:{ ideal : 1080},
                width : {ideal : 1920},
                },
                audio:false,
                frames:{min : 30, ideal:90}
            };
            setVideoStream({stream : Navigator.mediaDevices?.getUserMedia(userMediaObject)});
        }
    },[]);

    return videoStream;
}

export default useVideo;