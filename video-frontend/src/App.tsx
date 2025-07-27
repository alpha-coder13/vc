
import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';
import {authenticateUser, checkUserAccess} from './utilities/utilities';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoggedin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const handleLogin = useCallback((params :Object)=>{
    authenticateUser({handleSuccess:handleLoggedin,
      handleFailure:handleLogout,
      parameters:params
    })
  },[])

  useEffect(()=>{
    checkUserAccess({handleSuccess:handleLoggedin, handleFailure:handleLogout})
  },[])
  return (
    <div className="bg-slate-900 text-gray-200 min-h-screen w-full">
      {isAuthenticated ? (
        <MainLayout onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
