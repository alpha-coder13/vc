import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
const LoadingAnimation = ()=>{return <div className='fixed h-full w-screen flex items-center justify-center bg-black text-white text-xl '>
  <LoaderCircle className='animate-spin' height={"5vh"} width={"5vh"}/>&nbsp; Loading...
</div>}

const ErrAnimation = ()=>{return <div className='fixed h-full w-screen flex items-center justify-center bg-red-200 text-red-950 text-xl'>
       <TriangleAlert height={"5vh"} width={"5vh"} />&nbsp;Error Connecting Service
</div>}

root.render(
  // <React.StrictMode>
    <LoadingAnimation />
  // </React.StrictMode>
);
const aborter = new AbortController();
setTimeout(()=>{
  aborter.abort();
},[120000])
fetch('https://vc-service.onrender.com/',{
  method:"GET",
  signal:aborter.signal,
  headers:{
    'Content-Type' :'text/html',
  }
}).then(()=>{
  root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
}).catch(()=>{
root.render(
  // <React.StrictMode>
    <ErrAnimation />
  //
)
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
