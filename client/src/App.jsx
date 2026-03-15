import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestPage from './GuestPage';
import RulesPage from './RulesPage';
import GamePage from './GamePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import StatsPage from './StatsPage';
import socket from './socket';

function App() {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'token' && event.newValue === null) {
        console.log('Kijelentkezés észlelve egy másik fülön. Visszairányítás...');
  
        if (socket) socket.disconnect();

        window.location.href = '/'; 
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/stats" element={<StatsPage />}/>
      </Routes>
    </Router>
  );
}

export default App;