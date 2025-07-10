import { useEffect, useState } from "react"

const useVideo = (height, width)=>{

    const [videoStream , setVideoStream] = useState(null);
    
    useEffect(()=>{
        if(window){
            const Navigator =  window.navigator; 
            const userMediaObject = {
                video:true,
                audio:false,
                height:{min : height , ideal : 1080},
                width : {min : width , ideal : 1920},
                frames:{min : 30, ideal:90}
            };
            setVideoStream(Navigator.mediaDevices.getUserMedia(userMediaObject));
        }
    },[]);

    return videoStream;
}

export default useVideo;