const http = require('http');
const path = require('path');
const server = http.createServer();

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
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type');
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

server.listen(process.env.PORT || 3001,()=>{
    // console.log(process.env.PORT)
    console.log('server started');
})
