const Room = require('../classes/Room');
const Engine = require('../classes/Engine');

describe('Room Class', () => {
  let room;
  let ioMock;
  let onGameEndMock;
  let player1Data;
  let player2Data;

  beforeEach(() => {
    jest.useFakeTimers();

    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };

    onGameEndMock = jest.fn();

    player1Data = { name: 'Player1', socketid: 'socket1', playerId: 'user1' };
    player2Data = { name: 'Player2', socketid: 'socket2', playerId: 'user2' };

    room = new Room('room123', player1Data, player2Data, ioMock, onGameEndMock);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    expect(room.roomId).toBe('room123');
    expect(room.engine).toBeInstanceOf(Engine);
    expect(room.engine.player1.name).toBe('Player1');
    expect(room.engine.player1.userId).toBe('user1');
    expect(room.engine.player2.name).toBe('Player2');
    expect(room.engine.player2.userId).toBe('user2');
  });

  it('should start game and broadcast state', () => {
    const startRoundSpy = jest.spyOn(room.engine, 'startRound');
    const broadcastSpy = jest.spyOn(room, 'broadcastState');

    room.startGame();

    expect(ioMock.to).toHaveBeenCalledWith('room123');
    expect(ioMock.emit).toHaveBeenCalledWith('gameStart', expect.any(Object));
    expect(startRoundSpy).toHaveBeenCalled();
    expect(broadcastSpy).toHaveBeenCalled();
  });

  it('should successfully switch trump card and broadcast state', () => {
    jest.spyOn(room.engine, 'switchTrumpCard').mockReturnValue({ success: true });
    const broadcastSpy = jest.spyOn(room, 'broadcastState');

    room.handleSwitchTrumpCard('socket1');

    expect(room.engine.switchTrumpCard).toHaveBeenCalledWith(room.engine.player1);
    expect(broadcastSpy).toHaveBeenCalled();
  });

  it('should emit invalidSwitch on failed trump switch', () => {
    jest.spyOn(room.engine, 'switchTrumpCard').mockReturnValue({ success: false, message: 'Error' });

    room.handleSwitchTrumpCard('socket1');

    expect(ioMock.to).toHaveBeenCalledWith('socket1');
    expect(ioMock.emit).toHaveBeenCalledWith('invalidSwitch', { message: 'Error' });
  });

  it('should handle game over from a first move announcement win', () => {
    jest.spyOn(room.engine, 'handleMove').mockReturnValue({
      success: true,
      isRoundOver: { gameOver: true, winner: room.engine.player1 }
    });
    const endMatchSpy = jest.spyOn(room, 'endMatch');

    room.handleMove('socket1', { suit: 'makk', type: 'asz' });

    expect(endMatchSpy).toHaveBeenCalledWith(room.engine.player1);
  });

  it('should broadcast full game state correctly', () => {
    room.engine.player1.roundPoints = 10;
    room.engine.player2.roundPoints = 20;
    room.engine.deck.cards = [1, 2, 3];
    room.engine.activePlayer = room.engine.player1;

    room.broadcastState();

    expect(ioMock.to).toHaveBeenCalledWith('socket1');
    expect(ioMock.to).toHaveBeenCalledWith('socket2');
    
    expect(ioMock.emit).toHaveBeenCalledWith('gameStateUpdate', expect.objectContaining({
      roomId: 'room123',
      myPoints: 10,
      enemyPoints: 20,
      deckCount: 3,
      isMyTurn: true
    }));
  });
});