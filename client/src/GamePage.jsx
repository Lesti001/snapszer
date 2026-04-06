import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from './socket';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomInfo = location.state;

  const [gameState, setGameState] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const [invalidCard, setInvalidCard] = useState(null);
  const [invalidTrump, setInvalidTrump] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchEndMessage, setMatchEndMessage] = useState(null);
  const [announcement, setAnnouncement] = useState(null);

  const attemptedCardRef = useRef(null);
  const errorToastTimeoutRef = useRef(null);
  const invalidCardTimeoutRef = useRef(null);
  const invalidTrumpTimeoutRef = useRef(null);
  const matchEndTimeoutRef = useRef(null);
  const announcementTimeoutRef = useRef(null);

  useEffect(() => {
    if (!roomInfo) {
      navigate('/');
      return;
    }

    const handleGameStateUpdate = (newState) => {
      setGameState(newState);
      setErrorMessage(null);
      setInvalidCard(null);
      setInvalidTrump(false);
    };

    const handleInvalidMove = (data) => {
      setErrorMessage(data.message);
      setInvalidCard(attemptedCardRef.current);

      if (errorToastTimeoutRef.current) clearTimeout(errorToastTimeoutRef.current);
      if (invalidCardTimeoutRef.current) clearTimeout(invalidCardTimeoutRef.current);

      invalidCardTimeoutRef.current = setTimeout(() => {
        setInvalidCard(null);
      }, 500);

      errorToastTimeoutRef.current = setTimeout(() => {
        setErrorMessage(null);
      }, 2500);
    };

    const handleInvalidSwitch = () => {
      setInvalidTrump(true);

      if (invalidTrumpTimeoutRef.current) clearTimeout(invalidTrumpTimeoutRef.current);

      invalidTrumpTimeoutRef.current = setTimeout(() => {
        setInvalidTrump(false);
      }, 500);
    };

    const handleMatchEnded = (data) => {
      setMatchResult(data.isWinner);

      if (data.msg) {
        setMatchEndMessage(data.msg);
      }

      if (matchEndTimeoutRef.current) clearTimeout(matchEndTimeoutRef.current);

      matchEndTimeoutRef.current = setTimeout(() => {
        navigate('/');
      }, 4000);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.emit('requestGameState');
    socket.on('invalidMove', handleInvalidMove);
    socket.on('invalidSwitch', handleInvalidSwitch);
    socket.on('announceMentMessage', handleAnnounceMentMessage);
    socket.on('matchEnded', handleMatchEnded);

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('invalidMove', handleInvalidMove);
      socket.off('invalidSwitch', handleInvalidSwitch);
      socket.off('matchEnded', handleMatchEnded);
      socket.off('announceMentMessage', handleAnnounceMentMessage);
      if (errorToastTimeoutRef.current) clearTimeout(errorToastTimeoutRef.current);
      if (invalidCardTimeoutRef.current) clearTimeout(invalidCardTimeoutRef.current);
      if (invalidTrumpTimeoutRef.current) clearTimeout(invalidTrumpTimeoutRef.current);
      if (matchEndTimeoutRef.current) clearTimeout(matchEndTimeoutRef.current);
    };
  }, [roomInfo, navigate]);

  const handleCardClick = (card) => {
    if (gameState.isMyTurn && matchResult === null) {
      attemptedCardRef.current = card;
      socket.emit('playerMove', card);
    }
  };

  const handleTrumpClick = () => {
    if (gameState.isMyTurn && matchResult === null) {
      socket.emit('switchTrumpCard');
    }
  };

  const handleAnnounceMentMessage = (data) => {
    setAnnouncement(data);

    if (announcementTimeoutRef.current) clearTimeout(announcementTimeoutRef.current);

    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncement(null);
    }, 3500);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center font-sans">
        <div className="text-[#D39696] text-2xl font-semibold animate-pulse">Betőltés...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden font-sans">

      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translate(0, var(--tw-translate-y)) rotate(0); }
            20% { transform: translate(-6px, var(--tw-translate-y)) rotate(-2deg); }
            40% { transform: translate(6px, var(--tw-translate-y)) rotate(2deg); }
            60% { transform: translate(-6px, var(--tw-translate-y)) rotate(-2deg); }
            80% { transform: translate(6px, var(--tw-translate-y)) rotate(2deg); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}
      </style>

      {matchResult !== null && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[200] flex flex-col items-center justify-center">
          <div className={`text-6xl md:text-8xl font-black mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${matchResult ? 'text-green-400' : 'text-red-500'}`}>
            {matchResult ? 'GYŐZTÉL!' : 'VESZTETTÉL!'}
          </div>
          {matchEndMessage && (
            <div className="mb-6">
              <p className="text-white text-2xl font-bold">{matchEndMessage}</p>
            </div>
          )}
          <p className="text-white/80 text-xl font-semibold tracking-widest animate-pulse">
            Visszatérés a főoldalra...
          </p>
        </div>
      )}

      {errorMessage && matchResult === null && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-red-600/95 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.5)] z-[100] font-bold border-2 border-red-400 flex items-center space-x-3 transition-all duration-300 transform translate-y-0 opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-lg">{errorMessage}</span>
        </div>
      )}

      {announcement && matchResult === null && (
        <div className={`absolute top-12 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-2xl z-[100] font-bold border-2 flex items-center space-x-3 transition-all duration-300 transform translate-y-0 opacity-100 ${announcement.color === 'blue'
            ? 'bg-blue-600/95 shadow-[0_10px_40px_rgba(37,99,235,0.5)] border-blue-400'
            : 'bg-orange-500/95 shadow-[0_10px_40px_rgba(249,115,22,0.5)] border-orange-400'
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-lg">{announcement.msg}</span>
        </div>
      )}

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

      {(gameState.boardCard || gameState.secondBoardCard) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">

          {gameState.boardCard && (
            <img
              src={`/cards/${gameState.boardCard.suit}_${gameState.boardCard.type}.png`}
              alt="Első kártya"
              className={`w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md transition-all duration-300 transform ${gameState.secondBoardCard ? '-rotate-6 -translate-x-6' : 'rotate-3'
                }`}
              style={{ zIndex: 11 }}
            />
          )}

          {gameState.secondBoardCard && (
            <img
              src={`/cards/${gameState.secondBoardCard.suit}_${gameState.secondBoardCard.type}.png`}
              alt="Második kártya"
              className="absolute w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-2xl transition-all duration-300 transform rotate-6 translate-x-6"
              style={{ zIndex: 12 }}
            />
          )}
        </div>
      )}

      <div className="absolute top-1/2 left-4 sm:left-10 lg:left-20 -translate-y-1/2 w-48 sm:w-64 md:w-72 lg:w-80 h-auto z-10 group cursor-pointer">
        {gameState.deckCount > 0 ? (
          <>
            <div className="absolute -top-6 left-0 sm:left-4 md:left-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
              Még {gameState.deckCount} lap
            </div>

            {gameState.trumpCard && (
              <div className="absolute top-1/2 -translate-y-1/2 left-12 sm:left-16 md:left-20 lg:left-24 w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] rotate-90 z-">
                <img
                  src={`/cards/${gameState.trumpCard.suit}_${gameState.trumpCard.type}.png`}
                  alt="Adu lap"
                  onClick={handleTrumpClick}
                  className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${invalidTrump
                    ? 'border-4 border-red-600 animate-shake shadow-[0_0_30px_rgba(220,38,38,1)]'
                    : 'border-2 border-gray-300 shadow-sm'
                    } ${gameState.isMyTurn && matchResult === null ? 'cursor-pointer hover:shadow-xl hover:border-[#D39696]' : ''
                    }`}
                />
              </div>
            )}

            {[...Array(gameState.deckCount)].map((_, i) => (
              <img
                key={i}
                src="/cards/face_down.jpg"
                alt="Pakli kártya"
                className="absolute top-1/2 -translate-y-1/2 w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md pointer-events-none"
                style={{
                  left: `${i * 3}px`,
                  zIndex: i + 10
                }}
              />
            ))}
          </>
        ) : (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl shadow-md flex items-center justify-center">
            <img
              src={`/${gameState.trumpSuit.trim()}.png`}
              alt={`${gameState.trumpSuit}`}
              className="w-10 h-10 object-contain opacity-80"
            />
          </div>
        )}
      </div>

      {gameState.wonCards && gameState.wonCards.length > 0 && (
        <div className="absolute bottom-6 right-6 z-40 group flex flex-col items-end">

          <div className="absolute bottom-full right-0 mb-4 p-4 bg-white/95 backdrop-blur-md border-2 border-[#D39696]/30 rounded-2xl shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto origin-bottom-right w-max max-w-[85vw] sm:max-w-[400px] z-50">
            <h3 className="text-[#D39696] font-bold text-sm uppercase tracking-widest mb-3 border-b-2 border-[#D39696]/20 pb-1">
              Ütéseid
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-4 justify-end">
              {Array.from({ length: Math.floor(gameState.wonCards.length / 2) }).map((_, trickIndex) => {
                const card1 = gameState.wonCards[trickIndex * 2];
                const card2 = gameState.wonCards[trickIndex * 2 + 1];
                return (
                  <div key={trickIndex} className="relative flex w-16 sm:w-20 hover:scale-110 transition-transform cursor-default">
                    <img
                      src={`/cards/${card1.suit}_${card1.type}.png`}
                      className="w-12 sm:w-14 aspect-[130/234] object-cover rounded-lg shadow-md border border-gray-300 z-10 -rotate-3"
                      alt="Ütés lap 1"
                    />
                    {card2 && (
                      <img
                        src={`/cards/${card2.suit}_${card2.type}.png`}
                        className="absolute left-4 sm:left-6 w-12 sm:w-14 aspect-[130/234] object-cover rounded-lg shadow-xl border border-gray-300 z-20 rotate-6"
                        alt="Ütés lap 2"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative cursor-pointer hover:-translate-y-2 transition-transform duration-300">
            <img src="/cards/face_down.jpg" alt="Ütések alja" className="absolute top-1 left-1 w-20 sm:w-24 aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md z-10" />
            <img src="/cards/face_down.jpg" alt="Ütések közepe" className="absolute top-0.5 left-0.5 w-20 sm:w-24 aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-md z-20" />
            <img src="/cards/face_down.jpg" alt="Ütések teteje" className="relative w-20 sm:w-24 aspect-[130/234] object-cover border-2 border-gray-300 rounded-xl shadow-xl z-30" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-0 z-30">
        <div className="flex -space-x-8 md:-space-x-12 hover:space-x-1 md:hover:space-x-2 transition-all duration-300 ease-in-out px-4 md:px-10 items-end">
          {gameState.myHand.map((card, i) => {
            const isThisCardInvalid = invalidCard && invalidCard.suit === card.suit && invalidCard.type === card.type;

            return (
              <div
                key={i}
                className={`relative w-28 sm:w-32 md:w-36 lg:w-[160px] aspect-[130/234] transition-all duration-300 translate-y-[50%] ${gameState.isMyTurn && matchResult === null
                  ? 'cursor-pointer hover:-translate-y-2 md:hover:-translate-y-6 hover:z-50'
                  : 'cursor-not-allowed opacity-80'
                  }`}
                style={{ zIndex: isThisCardInvalid ? 100 : i }}
                onClick={() => handleCardClick(card)}
              >
                <img
                  src={`/cards/${card.suit}_${card.type}.png`}
                  alt={`${card.suit} ${card.type}`}
                  className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${isThisCardInvalid
                    ? 'border-4 border-red-600 animate-shake shadow-[0_0_30px_rgba(220,38,38,1)]'
                    : 'border-2 border-gray-300 shadow-lg hover:shadow-2xl hover:border-[#D39696]'
                    }`}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default GamePage;