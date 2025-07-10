
import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = useCallback(() => {
    // In a real app, you would perform JWT validation here.
    // For this mock, we'll just set isAuthenticated to true.
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

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
