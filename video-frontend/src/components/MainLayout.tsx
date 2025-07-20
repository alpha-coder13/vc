
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import VideoPlayer from './VideoElement/component/VideoPlayer';
import ChatBox from './ChatBox';
import useRTC from './RTC/hooks';
import AudioComponent from './AudioElement/components/AudioComponent';
import '../css/mainLayout.css';

interface MainLayoutProps {
  onLogout: () => void;
}



// --- Style Notes ---
// These classes would be defined in your CSS file to match the dark theme.
// 

const JoinLobby = ({ onJoin, RoomAPI }) => {
  const [joinState, setJoinState] =  useState<number>(1);
  const [roomID, setRoomID] =  useState<string>("");
  // Join States :
  // 1 : native state 
  // 2 : Input State
  const createRoom = useCallback(()=>{
      if(RoomAPI.current){
          fetch(RoomAPI.current,{
            headers:{
              'Content-type':'application/json',
            },
            mode:'cors',
            method:'GET'
          }).then((data)=>{
            if(!data.ok)return;
            return data.json();
          }).then((data)=>{
            if(data.data.room_id){
              setRoomID(data.data.room_id);
            }else{
              // handle Error
            }
          }).catch((err) => {
            // handle Error
          })

          setJoinState(3);
      }
  },[RoomAPI.current])

  const joinRoom = ()=>{
    setJoinState(2);
  }
  const handleRoomInput = (e : ChangeEvent<HTMLInputElement>) => {
     setRoomID(prev => e.target.value);
  }
  const handleJoin = (e :MouseEvent)=>{
      onJoin(roomID);
  }
  return (
   <div className="flex h-full  border-slate-700 shadow-lg justify-center items-center">
      {
        joinState == 1 ? (
          <>
          <button className="rounded-lg border h-20 mx-2  join-button  flex-1" onClick={joinRoom}>
            Join Room
          </button>
          <button className="rounded-lg border h-20 mx-2 join-button flex-1" onClick={createRoom}>
            Create Room
          </button>
          </>
        ):
        (
          <>
          <input className={`rounded-lg border h-20 mx-2 bg-slate-800 flex-1 px-3 ${joinState==3 && "select-all caret-transparent"}`} placeholder='RoomID' value={roomID} onChange={handleRoomInput} disabled={joinState ==3 ? true : false}>
          </input>
          <button className="rounded-lg border h-20 mx-2 join-button flex-1" onClick={handleJoin}>
            Join
          </button>
          </>
        )
      }
    </div>
  );
};


const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {


  const {makeCall, hangup, connectionState,RTCConnection,MediaStreamSent ,Signalling, RoomAPI} = useRTC();
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <h1 className="text-xl font-bold text-white">Video Conference</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
          <VideoPlayer  RTCConnection={RTCConnection} mode={"Remote"} connectionState={connectionState} MediaStreamSent={undefined}><></></VideoPlayer>
          <VideoPlayer  RTCConnection={RTCConnection} mode={"local"} connectionState={null} MediaStreamSent={MediaStreamSent}>
            <AudioComponent RTCPeerConnection={RTCConnection} MediaStreamSent={MediaStreamSent}/>
          </VideoPlayer>
        </div>
        <div className="lg:col-span-1 flex flex-col h-full ">
          {connectionState == 'connected' && <ChatBox Signalling={Signalling} />}
           {/* <ChatBox /> */}
          {connectionState !== 'connected' && <JoinLobby onJoin={makeCall} RoomAPI={RoomAPI}/>}
        </div> 
      </main>
    </div>
  );
};

export default MainLayout;
