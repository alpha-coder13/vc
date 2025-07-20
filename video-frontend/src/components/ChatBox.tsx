
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './types';
import SendIcon from './icons/SendIcon';

// const initialMessages: ChatMessage[] = [
//   { id: 1, text: "Hey everyone, welcome to the call!", sender: 'participant', timestamp: "10:30 AM" },
//   { id: 2, text: "Hi there! Glad to be here.", sender: 'user', timestamp: "10:31 AM" },
//   { id: 3, text: "Let's get started in a few minutes.", sender: 'participant', timestamp: "10:31 AM" },
// ];

const ChatBox: React.FC = ({Signalling}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(()=>{
    if(Signalling.current){
        console.log('triggered out');

      Signalling.current.on('incoming',(data)=>{
        console.log('triggered');
        const text = data.message;
        const id = messages.length+1;
        const sender = 'participant';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setMessages((prev)=> ([...prev,{text,id,sender,timestamp}]));
      })
    }
  },[])
  

  const handleSendMessage = useCallback((e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
      if (newMessage.trim() === '') return;
      if(Signalling.current){
        const text = newMessage;
        const id = messages.length+1;
        const sender = 'user';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setMessages((prev)=> ([...prev,{text,id,sender,timestamp}]));
        console.log('here');
        Signalling.current.emit('chatMessage',newMessage);
        
        setNewMessage('');
      } 
  },[Signalling.current,newMessage,messages])


  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Meeting Chat</h2>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'participant' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0"></div>}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-gray-300 rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'} text-right`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full py-2 px-4 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-slate-600" disabled={!newMessage.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
