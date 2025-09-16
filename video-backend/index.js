const http = require('http');
const path = require('path');
const server = http.createServer();

require('dotenv').config(path.resolve(process.cwd(),'.env'));
const {randomUUID} =require('crypto');
const {Server} =  require('socket.io');
const { parse } = require('url');
const { stdin } = require('process');


const ioServer = new Server(server,{
    cors:{
        //  origin: "https://vc-frontend-asfd.onrender.com/"
        origin:"*"
    }
});


const RoomSet = new Map(); // roomID -> set of sockets

const ioArray = new Map(); // socket id -> room ID

const RoomInterVals = new Map();  // in cache we will be removing the dependency of maps and will be employing eviction algorithm (TTL) in redis for room id;

/** 
function createRoom(){
    // get room count from redis : 
    // send the room count , increment the same by the code.
    // return  the room count 
    // return randomUUID();
    let roomCount ;
    return roomCount;
}

commenting the above as to test new redis createRooms
*/

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


// function expireRoom(RoomID){
//     const deleteRoom = setTimeout(() => {
//         RoomSet.delete(RoomID);
//         RoomInterVals.delete(RoomID);
//     }, (20*60*1000));
//     RoomInterVals.set(RoomID,deleteRoom); // this will be handled by redis itself;
// }

ioServer.on("connection",(socket)=>{
    console.log("client connected",socket.id);
    ioArray.set(socket.id,undefined);
    handleSocket(socket);
})

ioServer.on("disconnect")



server.on('request', async (req,res)=>{

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

        // if(RoomSet.size == 20){
            // res.end(JSON.stringify({
            //     'code' :'200',
            //     'status' : 'Rooms full, Try after sometime, ETA : 10mins',
            //     'data' : {
            //         'room_id' : '',
            //     }
            // })) 
            // return;
        // }

        //  removinf room creation limitation code
        const roomData = await createRoom();
        //  RoomSet.set(roomData, new Set());
        // |

        // -> redis code to create a room key
        // expireRoom(roomData); // this logic will be handled by the the listener on key removal (user)

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




// create a redis instance:
// 3 tables : map(string -> set), map(string -> string), array(string)

// redis instanciate :
// redis connection close:
// TTL for table 3: -> event listen (Remove from table map(string->set)); 



/// okay so after a deeper thought : 
// I cannot store the connections objects in redis
// the messaging is to be handled using redis pub sub
// lets see how 
 // user A connects  : creates a room (room entry made to redis || made to be persistent)
 // user B connects  : joins room A has provided 
 // redis  room : id   has user_A_socketID and user_B_socketID
 // to create a 2 way rable  
 // we will also store user:id room_id
 //
// now design for messaging : redis pub sub to be studied (core idea : on message , the message is published in the room channel and all the sockets will get the message)
// now on a socket exit : 1. remove the user from the room : if the room still has people : just del the user:id 
//                        2. if the room has no people :  set  a expiy time for the room:id , in which if any users join : set it to persitent (hw to check it's exsitence )just do a get



// ------------------------------- REDIS OBJECTS ---------------------------//
const EXPIRE_ROOM_DURATION = 10*60; //seconds
class RedisConnector{
    #redisClient;
    #connectionStatus; 
    constructor(username=process.env.REDIS_RW_USERNAME , password=process.env.REDIS_RW_PASSWORD, hostname=process.env.REDIS_RW_HOSTNAME, port=process.env.REDIS_RW_PORT){
        if(this.#redisClient == null || this.#redisClient == undefined){
            const {createClient} = require('redis');
            this.#redisClient = createClient({
                username,
                password,
                socket:{
                    host,
                    port,
                }
            })
            if(this.#connectionStatus == undefined || this.#connectionStatus == false){
                this.#redisClient.connect().then(()=>{
                    this.#connectionStatus = true;
                }).catch(err => {this.#connectionStatus = false, console.error(err)});
            }
        }
         return {client : this.#redisClient, status : this.#connectionStatus };
    }
}

class UserPool{
    static #pool;
    static #connectionCount;
    constructor(){
        UserPool.#pool = new Map();
        UserPool.#connectionCount = 0;
        return;
    }

    static getUserID(socketID){
        if(!UserPool.#pool.has(socketID)){
            UserPool.#pool.set(socketID,`vc-user:${UserPool.#connectionCount+1}`);
            UserPool.#connectionCount++;      
        }
        return UserPool.#pool.get(socketID);
    }
    static deleteUserID(socketID){
        return UserPool.#pool.delete(socketID);
    }
}

class RedisSubscriberPool{
    static #pool;
    constructor(){
        RedisSubscriberPool.#pool = new Map();
        return;
    }

    static retievePubSubClient(userID){
        let PUB_SUB_CL;  
        if(!RedisSubscriberPool.#pool.has(userID)){
            PUB_SUB_CL = new RedisConnector(process.env.REDIS_PUBSUB_HOSTNAME,process.env.REDIS_PUBSUB_USERNAME,process.env.REDIS_PUBSUB_PASSWORD,process.env.REDIS_PUBSUB_PORT);
            RedisSubscriberPool.#pool.set(userID,PUB_SUB_CL);
        }else{
            PUB_SUB_CL = RedisSubscriberPool.#pool.get(userID);
        }
        return PUB_SUB_CL;
    }

    static async subscribe(userID,roomID,subscriptionHandler){
        let PUB_SUB_CL = RedisSubscriberPool.retievePubSubClient(userID);
        if(PUB_SUB_CL.status != true){
            console.error("connection not established");
            return;
        }
        await PUB_SUB_CL.client.subscribe(`room:${roomID}`,subscriptionHandler);
        // handle subscription error
    }

    static async unsubscribe(userID,roomID){
        let PUB_SUB_CL = RedisSubscriberPool.retievePubSubClient(userID);
         if(PUB_SUB_CL.status != true){
            console.error("connection not established");
            return;
        }

        await PUB_SUB_CL.client.unsubscribe(`room:${roomID}`);
        // handle unsubscription error
    }

    static deletePubSubClient(userID){
        let PUB_SUB_CL = RedisSubscriberPool.retievePubSubClient(userID);
        if(PUB_SUB_CL){
            PUB_SUB_CL.disconnect().then(()=>{
                RedisSubscriberPool.#pool.delete(userID);
            }).catch(console.error /*error in closing connection*/);
        }
    }
}

new RedisSubscriberPool();
new UserPool();

const {client:CLIENT, status : STATUS} = new RedisConnector();

// testing code , works fine
// (async()=>{
// await CLIENT.set('foo', 'bar');
// let result = await CLIENT.get('foo');
// console.log(result) ;
// await CLIENT.expire('foo', '10');
// setTimeout(async()=>{
// result = await CLIENT.get('foo');
// console.log(result) ;
// },11000);
// })();

// ---------------------------------------------------- REDIS DMFs --------------------------------------------------


async function createRoom(){
    // here we assume the redis client is at cglobal object assigned to CLIENT

    let tempResult = await CLIENT.get('roomNumber');
    console.log(tempResult);
    if(tempResult == null){
        tempResult = 0;
    }else{
        tempResult++;
    }
    // we can add a round logic for the next available room for a loop of 50000 rooms
    CLIENT.set('roomNumber' ,tempResult); // this can cause  race conditions // how can I avoid it ?
    return tempResult;

}

async function joinRoom(roomID, socketID){
    let userID = UserPool.getUserID(socketID);
    let roomJoined = await CLIENT.sendCommand(['SADD',`room:${roomID}`,userID]);
    await CLIENT.sendCommand(['PERSIST', `room:${roomID}`]);
    let roomAssigned = await CLIENT.sendCommand(['SET',userID,`room:${roomID}`]);

    await RedisSubscriberPool.subscribe(userID,roomID,()=>{ /** need a subscription handler */}); // this subscription handler should be a event listener
    /**
     * ehy   ? if I just add a function it would execute the function, however if I use  eventEmmitter I can pass the message to my socket by listeing to the event emitter and not creating seperate handling functions for each of my sockets
        but I would definitely require a place to store all my eventListeners 
    */
    let userPubSubCL = await RedisSubscriberPool.retievePubSubClient(userID);
    await userPubSubCL.sendCommand(['PUBLISH',`room:${roomID}`, `${userID} has joined` ]);
    /// here the user subscription is required as well  to be subscribing to the room ID
}


async function leaveRoom(roomID , socketID) {
    
    let userID = UserPool.getUserID(socketID);
    let roomleft = await CLIENT.sendCommand(['SREM',`room:${roomID}`,userID ]);

    let roomFilledCapacity = await CLIENT.sendCommand(['SCARD', `room:${roomID}`]);

    if(roomFilledCapacity == 0){
        await CLIENT.sendCommand(['EXPIRE', `room:${roomID}`, EXPIRE_ROOM_DURATION]);
    }

    let roomUnAssigned = await CLIENT.sendCommand(['DEL',userID]);
    await userPubSubCL.sendCommand(['PUBLISH',`room:${roomID}`, `${userID} has Left` ]);
    await RedisSubscriberPool.unsubscribe(userID,roomID);
    // similarly unsubscription command;
}


async function disconnectUser(socketID){
    UserPool.deleteUserID(socketID);
    return;
}



/// notes about redis subscription:
// - dynamically created (if not present)
// - dies post all subscribers have unsubscribe
// syntaxt for channel that we use ('roo:id') 


// -------------------------------- a lvie process redis command executed for console admin --------------------------

if(process.env.USER == 'admin'){
    let isAAdmin = false;
    process.stdin.on('data',async (data)=>{
    if(data.toString('utf-8').includes('pass')){
        let passHAndler = data.toString('utf-8').split('=');
        if(passHAndler.length != 2 ){
             console.error('The passed argument should be =<password>');
            return;
        }
        let password = passHAndler[passHAndler.length-1].slice(0,-2);
        const {createHash} = require('crypto');
        const str = createHash('SHA256').update(password).digest('base64');
        if(str == process.env.ADMIN_PASS){
            isAAdmin = true;
        }else{
            isAAdmin = false;
        }
        return;
    }
    if(data.toString('utf-8').includes('reset')){
        if(!isAAdmin){console.error("not a admin") ; return;}
         isAAdmin = false;
        let dataString  = data.toString('utf-8');
        let commandString = dataString.split('-')[1];
        if(commandString == undefined || commandString.split('|').length < 2){
            console.error('The passed argument should be -<command>|<key>|<value>')
            return;
        }
        let commands = [...commandString.split('|')];
        commands[commands.length-1] = commands[commands.length-1].slice(0,-2);
        console.log(commands);
        console.log(await CLIENT.sendCommand([...commands]));
        return;
    }
})
}

// what did I do today :
// 1. created a basic redis instance to connect to the redis DB
// 2. created the code to create Rooms
// 3. created the code to use a console admin pannel to reset data pointers
// urayamashii desu /-( @ o @ )_/ 