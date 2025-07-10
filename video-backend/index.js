const http = require('http');
const server = http.createServer();

const {Server} =  require('socket.io');

const ioServer = new Server(server,{
    cors:{
         origin: "http://localhost:3000"
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





server.listen(2001,()=>{
    console.log('server started');
})