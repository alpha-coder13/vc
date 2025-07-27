
// const url = "vc-service.onrender.com";
const url = "localhost:3001";

interface userAccessParameters{
    handleSuccess : (param:String|undefined) => void,
    handleFailure : (param:String|undefined) => void,
}

export const checkUserAccess  =  ({handleSuccess, handleFailure}:userAccessParameters)=>{
    fetch(`https://${url}/vc-auth/`,{
        mode:'cors',
        method:'POST',
    }).then((data)=>{
        if(data.statusText.toLowerCase()!=='ok')
            return ;
        return data.text()
    }).then((data)=>{
        try{
            if(typeof data === 'string'){
                let parsedData = JSON.parse(data);
                if(parsedData.status.toLowerCase() === 'success'){
                    handleSuccess(undefined);
                }
            }else{
                handleFailure("The data recived is invalid");
            }
        }catch(error){
            console.log('the response isnot a valid JSON');
        }
    }).catch(error =>{
        handleFailure(error.message);
    })
}

interface authenticateUserParams extends userAccessParameters{
    parameters : Object ,
}

export const authenticateUser = ({handleSuccess, handleFailure, parameters} :authenticateUserParams)=>{
    fetch(`https://${url}/vc-login/`,{
        headers:{
            "Content-Type":"application/json",
        },
        mode:'cors',
        body:JSON.stringify(parameters),
    }).then((data)=>{
        if(data.statusText.toLowerCase() !== 'ok'){
            return "Failed";
        }
        return data.text();
    }).then((data)=>{ 
        try{
            if(typeof data === 'string'){
                let parsedData = JSON.parse(data);
                if(parsedData.status.toLowerCase() === 'success'){
                    handleSuccess(undefined);
                }
            }else{
                handleFailure("The data recived is invalid");
            }
        }catch(error){
            console.log('the response isnot a valid JSON');
        }
    }).catch(error =>{
        handleFailure(error.message);
    })
}

interface createRoomParameters{
    handleSuccess:(param : any)=>void, 
    handleFailure:(...param : any)=>void,
}

    // const RoomAPI =  useRef('https://vc-service.onrender.com/createRoom')

export const createUserRoom = ({handleSuccess, handleFailure}:createRoomParameters) =>{
    fetch(`https://${url}/vc-createRoom`,{
        mode:'cors',
        method:'GET'
    }).then((data)=>{
      if(!data.ok)return;
      return data.json();
    }).then((data)=>{
      if(data.data.room_id){
        handleSuccess(data.data.room_id);
      }else{
        // handle Error
      }
    }).catch((err) => {
      // handle Error
    })
    
}