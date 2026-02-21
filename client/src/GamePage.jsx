import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomInfo = location.state;

  // Itt tároljuk a játék állapotát, amit majd a szerver küld ('gameStateUpdate')
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!roomInfo) {
      navigate('/');
      return;
    }

    // TODO: Itt fogunk feliratkozni a socketre:
    // socket.on('gameStateUpdate', (newState) => setGameState(newState));

    // MOCK ADAT: Ideiglenes állapot, amíg nincs rákötve a backend, 
    // hogy tudd tesztelni a UI-t és a képeket.
    setGameState({
      myHand: [
        { suit: 'makk', type: 'alsó' }, 
        { suit: 'tök', type: 'ász' }, 
        { suit: 'piros', type: 'X' }, 
        { suit: 'zöld', type: 'király' }, 
        { suit: 'makk', type: 'VII' }
      ],
      enemyHandCount: 5,
      deckCount: 9,
      trumpCard: { suit: 'makk', type: 'alsó' }
    });

  }, [roomInfo, navigate]);

  if (!gameState) {
    return <div className="p-10 flex justify-center items-center h-screen">Játék betöltése...</div>;
  }

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      
      {/* --- ELLENFÉL KEZE (Fent középen) --- */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2">
        <div className="flex -space-x-12">
          {[...Array(gameState.enemyHandCount)].map((_, i) => (
            <img 
              key={i} 
              src="/hatoldal.jpg" 
              alt="Ellenfél kártyája" 
              className="w-28 h-40 object-cover border border-gray-400 rounded-md shadow-md bg-gray-200"
            />
          ))}
        </div>
      </div>

      {/* --- PAKLI ÉS ADU (Középen bal oldalt) --- */}
      {/* Az abszolút tároló adja meg a fix pozíciót a képernyőn */}
      <div className="absolute top-1/2 left-20 -translate-y-1/2 w-40 h-40">
        
        {/* Adu lap: Elforgatva és a pakli alá csúsztatva */}
        {gameState.trumpCard && (
          <img 
            src={`IDE_LINKELD_A_KARTYA_KEPET_EZEKBOL_${gameState.trumpCard.suit}_${gameState.trumpCard.type}`} 
            alt="Adu lap" 
            className="absolute top-1/2 -translate-y-1/2 left-10 w-28 h-40 object-cover border border-gray-400 rounded-md shadow-sm rotate-90"
          />
        )}

        {/* Pakli: A kártyákat egymásra csúsztatjuk egy kis eltolással (i * 2px), így 3D hatást kelt */}
        {[...Array(gameState.deckCount)].map((_, i) => (
          <img 
            key={i} 
            src="IDE_LINKELD_A_KARTYA_HATLAP_KEPET" 
            alt="Pakli kártya" 
            className="absolute w-28 h-40 object-cover border border-gray-400 rounded-md shadow-md bg-gray-200"
            style={{ 
              top: `${i * 2}px`, 
              left: `${i * 2}px`,
              zIndex: i + 10 // Biztosítja, hogy a pakli az adu felett legyen
            }}
          />
        ))}
      </div>

      {/* --- SAJÁT KÉZ (Lent középen) --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex -space-x-12">
          {gameState.myHand.map((card, i) => (
            <img 
              key={i} 
              src={`IDE_LINKELD_A_KARTYA_KEPET_EZEKBOL_${card.suit}_${card.type}`} 
              alt={`${card.suit} ${card.type}`} 
              className="w-28 h-40 object-cover border border-gray-400 rounded-md shadow-lg bg-gray-100 transition-transform duration-200 hover:-translate-y-6 hover:z-50 cursor-pointer relative"
              style={{ zIndex: i }} // Ahogy haladunk jobbra, úgy kerülnek egyre feljebb a rétegekben
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default GamePage;