import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from './socket'; // <-- Közös socket importálása

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomInfo = location.state;

  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Ha nincs szobainfó (pl. csak úgy beírja az URL-t), visszadobjuk a főoldalra
    if (!roomInfo) {
      navigate('/');
      return;
    }

    // Feliratkozás a szervertől érkező frissítésekre
    const handleGameStateUpdate = (newState) => {
      console.log("Új játékállapot:", newState);
      setGameState(newState);
    };

    const handleInvalidMove = (data) => {
      // Itt egyelőre egy egyszerű alert, de később cserélheted Toast értesítésre
      alert(data.message);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);

    socket.emit('requestGameState');
    socket.on('invalidMove', handleInvalidMove);

    return () => {
      // Komponens leállásakor takarítunk
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('invalidMove', handleInvalidMove);
    };
  }, [roomInfo, navigate]);

  // Lépés elküldése a szervernek
  const handleCardClick = (card) => {
    if (gameState.isMyTurn) {
      socket.emit('playerMove', card);
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center font-sans">
        <div className="text-[#D39696] text-2xl font-semibold animate-pulse">Asztal előkészítése...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- ELLENFÉL INFORMÁCIÓS PANEL --- */}
      <div className={`absolute top-6 left-6 p-4 rounded-2xl shadow-xl w-56 z-20 transition-all ${!gameState.isMyTurn ? 'bg-[#D39696]/20 border-2 border-[#D39696]' : 'bg-[#D39696]/10 border border-[#D39696]/20'} backdrop-blur-sm`}>
        <h2 className="text-xl font-bold text-gray-700 truncate">{gameState.enemyName}</h2>
        {!gameState.isMyTurn && <span className="text-xs font-semibold text-[#D39696] uppercase tracking-wider">Ő következik</span>}
        
        <div className="mt-3 text-sm space-y-2">
          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
            <span className="text-gray-600 font-medium">Meccspont:</span>
            <span className="font-bold text-[#D39696] text-base">{gameState.enemyGamePoints} / 7</span>
          </div>
          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
            <span className="text-gray-600 font-medium">Ütéspont:</span>
            <span className="font-bold text-gray-800 text-base">{gameState.enemyPoints}</span>
          </div>
        </div>
      </div>

      {/* --- SAJÁT INFORMÁCIÓS PANEL --- */}
      <div className={`absolute bottom-6 left-6 p-4 rounded-2xl shadow-xl w-56 z-20 transition-all ${gameState.isMyTurn ? 'bg-[#D39696]/20 border-2 border-[#D39696]' : 'bg-[#D39696]/10 border border-[#D39696]/20'} backdrop-blur-sm`}>
        <h2 className="text-xl font-bold text-gray-700">Te</h2>
        {gameState.isMyTurn && <span className="text-xs font-semibold text-[#D39696] uppercase tracking-wider">Te jössz!</span>}
        
        <div className="mt-3 text-sm space-y-2">
          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
            <span className="text-gray-600 font-medium">Meccspont:</span>
            <span className="font-bold text-[#D39696] text-base">{gameState.myGamePoints} / 7</span>
          </div>
          <div className="flex justify-between items-center bg-white/50 px-3 py-1.5 rounded-lg">
            <span className="text-gray-600 font-medium">Ütéspont:</span>
            <span className="font-bold text-gray-800 text-base">{gameState.myPoints}</span>
          </div>
        </div>
      </div>

      {/* --- ELLENFÉL KEZE --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="flex -space-x-8 md:-space-x-12">
          {[...Array(gameState.enemyHandCount)].map((_, i) => (
            <img 
              key={i} 
              src="/cards/face_down.jpg" 
              alt="Ellenfél kártyája" 
              className="w-24 sm:w-28 md:w-32 lg:w-[140px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md -translate-y-[65%]"
            />
          ))}
        </div>
      </div>

      {/* --- ASZTAL KÖZEPE (Kijátszott lapok) --- */}
      {gameState.boardCard && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <img 
            src={`/cards/${gameState.boardCard.suit}_${gameState.boardCard.type}.png`} 
            alt="Kijátszott kártya" 
            className="w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-xl transform rotate-3"
          />
        </div>
      )}

      {/* --- PAKLI ÉS ADU --- */}
      <div className="absolute top-1/2 left-4 sm:left-10 lg:left-20 -translate-y-1/2 w-48 sm:w-64 md:w-72 lg:w-80 h-auto z-10">
        {gameState.trumpCard && (
          <img 
            src={`/cards/${gameState.trumpCard.suit}_${gameState.trumpCard.type}.png`} 
            alt="Adu lap" 
            className="absolute top-1/2 -translate-y-1/2 left-12 sm:left-16 md:left-20 lg:left-24 w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-sm rotate-90"
          />
        )}

        {[...Array(gameState.deckCount)].map((_, i) => (
          <img 
            key={i} 
            src="/cards/face_down.jpg" 
            alt="Pakli kártya" 
            className="absolute top-1/2 -translate-y-1/2 w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md"
            style={{ 
              left: `${i * 3}px`, 
              zIndex: i + 10 
            }}
          />
        ))}
      </div>

      {/* --- SAJÁT KÉZ --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 z-30">
        <div className="flex -space-x-8 md:-space-x-12 hover:space-x-1 md:hover:space-x-2 transition-all duration-300 ease-in-out px-4 md:px-10 items-end">
          {gameState.myHand.map((card, i) => (
            <img 
              key={i} 
              src={`/cards/${card.suit}_${card.type}.png`} 
              alt={`${card.suit} ${card.type}`} 
              className={`w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-lg transition-all duration-300 translate-y-[65%] hover:z-50 relative ${gameState.isMyTurn ? 'cursor-pointer hover:-translate-y-2 md:hover:-translate-y-6 hover:shadow-2xl hover:border-[#D39696]' : 'cursor-not-allowed opacity-80'}`}
              style={{ zIndex: i }} 
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default GamePage;