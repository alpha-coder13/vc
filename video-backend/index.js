const http = require('http');
const path = require('path');
const server = http.createServer();
const crypto = require('crypto');

require('dotenv').config(path.resolve(process.cwd(),'.env'));
const {randomUUID} =require('crypto');
const {Server} =  require('socket.io');
const { parse } = require('url');

const ioServer = new Server(server,{
    cors:{
         origin: "*"
    }
});
const RoomSet = new Map();
const ioArray = new Map();
const RoomInterVals = new Map();

function createRoom(){
    return randomUUID();
}


class User{
    #secureKey;
    #identifierKey;
    constructor(username, password){
        this.#identifierKey = crypto.createHmac('SHA256',`${username}-${password}`).digest('base64');
        this.#secureKey = this.#identifierKey.slice(0,5)+'-vc-backend-user';
    }

    getUser(){
        return {
            id : this.#identifierKey,
            key :this.#secureKey
        }
    }
    
}

class VCBackendUserDB{
    static #dbUrl = process.env.USER_DB_URL;
    static #dbUsername = process.env.USER_DB_USERNAME;
    static #dbUserPass = process.env.USER_DB_PASSWORD;
    static #dbconnection = undefined;
    static async initializeDBConnection(){
        // connect to DB , assign the same ot db connection;
    }
    static async userGet(username, password){
        const userObj = new User(username, password);
        const {id} = userObj;
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                reject("db not initialized yet");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })
        // fetch a uer from the DB
    }
    static async  userSet(username, password){
        // add a user 
        const userObj = new User(username, password);
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                reject("db not initialized yet");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })

    }
    static async closeDBConnetion(){
        return  new Promise((resolve, reject)=>{
            if(VCBackendUserDB.#dbconnection == undefined){
                resolve("db not initialized yet hence not closed");
            }

            // VCBackendUserDB.#dbconnection // methds declaration
        })
    }
}


function handleSocket(socket){
    // const peerList = io
    // socket.emit("message",{"peerList" : } )

    socket.on('joinRoom',(data)=>{
       if(!data.RoomID ||  RoomSet.get(data.RoomID) == 'undefined'){
            socket.emit('error',{"message" : "Not a Valid RoomID , Create one or Join a Valid Room"})
            return;
       }else if(RoomSet.get(data.RoomID).size == 2){
            socket.emit('error',{"message" : "RoomFull , Please wait or contact the Room Owner"})
            return;
       }else{
        ioArray.set(socket.id,data.RoomID);
        RoomSet.get(data.RoomID).add(socket)
        RoomInterVals.delete(data.RoomID);
        socket.emit('joined',"success");
         return ;
       }
    })

    socket.on('sendOffer',(data)=>{
        const RoomID = ioArray.get(socket.id);
        if(!RoomID){
            socket.emit('error',{'message' : "not in a valid room"});
            return;
        }
        RoomSet.get(RoomID).forEach((value)=>{
            if(value!=socket){
                value.emit('message',data)
            }
        })
    })

    socket.on('sendAnswer',(data)=>{
        const RoomID = ioArray.get(socket.id);
        if(!RoomID){
            socket.emit('error',{'message' : "not in a valid room"});
            return;
        }
        RoomSet.get(RoomID).forEach((value)=>{
            if(value!=socket){
                value.emit('message',data)
            }
        })
    })

    socket.on('iceCandidate',(data)=>{
        const RoomID = ioArray.get(socket.id);
        if(!RoomID){
            socket.emit('error',{'message' : "not in a valid room"});
            return;
        }
        RoomSet.get(RoomID).forEach((value)=>{
            if(value!=socket){
                value.emit('message',{"iceCandidate":data})
            }
        })
    })

    socket.on('disconnect',(data)=>{
        const RoomID = ioArray.get(socket.id);
        if(RoomID){
            RoomSet.get(RoomID).delete(socket);
            ioArray.delete(socket.id);
            if(RoomSet.get(RoomID).size == 0){
                expireRoom(RoomID);
            }
        }        
        console.log("client disconnected", socket.id);
    })

    socket.on('chatMessage',(data)=>{
        const RoomID = ioArray.get(socket.id);
        if(!RoomID){
           socket.emit('error',{'message' : "not in a valid room"});
           return;
        } 
        RoomSet.get(RoomID).forEach((val1) => {
            if(val1 !== socket){
               console.log(data, val1.id, socket.id);
                val1.emit('incoming',{"message" : JSON.stringify(data)});
            }
        })
    })
}


function expireRoom(RoomID){
    const deleteRoom = setTimeout(() => {
        RoomSet.delete(RoomID);
        RoomInterVals.delete(RoomID);
    }, (20*60*1000));
    RoomInterVals.set(RoomID,deleteRoom);
}

ioServer.on("connection",(socket)=>{
    console.log("client connected",socket.id);
    ioArray.set(socket.id,undefined);
    handleSocket(socket);
})



server.on('request', (req,res)=>{

    const parsedURL = parse(req.url,true);
    if(parsedURL.pathname.startsWith('/socket.io/')){
        return ;
    }
    res.setHeader('Access-Control-Allow-Origin','https://vc-frontend-asfd.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    res.writeHead(200,{
        'Content-Type' : 'application/json',
    })

    if(req.url.includes('createRoom') && req.method.toUpperCase() === 'GET'){

        if(RoomSet.size == 20){
            res.end(JSON.stringify({
                'code' :'200',
                'status' : 'Rooms full, Try after sometime, ETA : 10mins',
                'data' : {
                    'room_id' : '',
                }
            }))
            return;
        }
        const roomData = createRoom();
        RoomSet.set(roomData, new Set());
        expireRoom(roomData);

        res.end(JSON.stringify({
            'code' :'200',
            'status' : 'Room SuccessFully Created,expires in 10 minutes',
            'data' : {
                'room_id' : roomData,
            }
        }))
        return;
    }else{
        res.end(JSON.stringify({
            'code' :'204',
            'status' : 'Not a Valid Request',
            'data' : {
                'room_id' : "/createRoom -- GET",
            }
        }))
    }
})


function handleAuthMiddleware(req, res){
    var cookieObj = cookieParsertoObj(req.headers.Authorization);
    // console.log(cookieObj);
    var cookieStr =  cookieParsertoStr(cookieObj);
    // console.log(cookieStr);
    return true
}

function cookieParsertoObj(cookieStr){
    const cookieArray= cookieStr.split(';').map((val)=>val.trim());
    const cookieObj = {};
    for(let a  of cookieArray){
        let [name , value] = a.split("=");
        cookieObj[name] = value;
    }
    return cookieObj;
}


function cookieParsertoStr(cookieObj){
    let cookieStr = Object.keys(cookieObj).reduce((prev,val)=>{return prev+= val+'='+cookieObj[val]+'; '},'')
    return cookieStr;
}
server.listen(process.env.PORT || 3001,()=>{
    // console.log(process.env.PORT)
    console.log('server started');
})
