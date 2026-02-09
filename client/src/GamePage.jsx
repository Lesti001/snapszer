import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const roomInfo = location.state;

  useEffect(() => {
    if (!roomInfo) {
      navigate('/');
    }
  }, [roomInfo, navigate]);

  if (!roomInfo) {
    return null; 
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Játék elindult!</h1>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Szoba ID:</strong> {roomInfo.roomId}</p>
        <p><strong>Játékosok:</strong> {roomInfo.players.join(' vs ')}</p>
        
        <pre className="mt-4 text-xs bg-black text-white p-2 rounded">
          {JSON.stringify(roomInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default GamePage;