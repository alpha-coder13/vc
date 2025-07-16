const http = require('http');
const path = require('path');
const server = http.createServer();
require('dotenv').config(path.resolve(process.cwd(),'.env'));

const {Server} =  require('socket.io');

const ioServer = new Server(server,{
    cors:{
         origin: "*"
    }
});

const ioArray = new Set();
function handleSocket(socket){
    // const peerList = io
    // socket.emit("message",{"peerList" : } )
    socket.on('sendOffer',(data)=>{
        ioArray.forEach((value)=>{
            if(value!=socket){
                value.emit('message',data)
            }
        })
    })

    socket.on('sendAnswer',(data)=>{
        ioArray.forEach((value)=>{
            if(value!=socket){
                value.emit('message',data)
            }
        })
    })

    socket.on('iceCandidate',(data)=>{
        ioArray.forEach((value)=>{
            if(value!=socket){
                value.emit('message',{"iceCandidate":data})
            }
        })
    })

    socket.on('disconnect',(data)=>{
            ioArray.delete(socket);
            console.log("client disconnected", socket.id);
    })
}
ioServer.on("connection",(socket)=>{
    console.log("client connected",socket.id);
    ioArray.add(socket);
    handleSocket(socket);
})





server.listen(process.env.PORT || 3001,()=>{
    // console.log(process.env.PORT)
    console.log('server started');
})