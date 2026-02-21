const Engine = require('./Engine');
const Player = require('./Player');

class Room {
  constructor(roomId,player1Data, player2Data, io) {
    this.roomId = roomId;
    this.io = io;
    
    const p1 = new Player(player1Data.name, player1Data.socketid);
    const p2 = new Player(player2Data.name, player2Data.socketid);

    this.engine = new Engine(p1, p2);
  }

  startGame() {
    this.io.to(this.roomId).emit('gameStart', {
      roomId: this.roomId,
      players: [this.engine.player1.name, this.engine.player2.name],
      message: 'A játék indul!'   
    });

    this.engine.startRound();
    this.broadcastState();
  }

  handleMove(socketId, cardData) {
    let player = null;
    if (this.engine.player1.socketId === socketId) player = this.engine.player1;
    else if (this.engine.player2.socketId === socketId) player = this.engine.player2;

    if (!player) return;

    const result = this.engine.handleMove(player, cardData);

    if (result && !result.success) {
      //SENDING MSG THAT MOVE IS INVALID
      this.io.to(socketId).emit('invalidMove', { 
        message: result.message 
      });

      return;
    }

    this.broadcastState();
  }

  broadcastState() {
    [this.engine.player1, this.engine.player2].forEach(player => {
      const isPlayer1 = player === this.engine.player1;
      const opponent = isPlayer1 ? this.engine.player2 : this.engine.player1;

      const gameState = {
        roomId: this.roomId,
        myHand: player.hand,
        myPoints: player.roundPoints,
        myGamePoints: player.gamePoints,
        
        enemyName: opponent.name,
        enemyHandCount: opponent.hand.length,
        enemyPoints: opponent.roundPoints,
        enemyGamePoints: opponent.gamePoints,

        boardCard: this.engine.boardCard,
        trumpCard: this.engine.trumpCard,
        trumpSuit: this.engine.trumpSuit,
        deckCount: this.engine.deck.cards.length,
        isClosed: this.engine.isClosed,
        
        activePlayerName: this.engine.activePlayer ? this.engine.activePlayer.name : null,
        isMyTurn: this.engine.activePlayer === player,
        
        gameStatus: this.engine.gameStatus,
        winnerName: (this.engine.gameStatus === 'FINISHED' && this.engine.activePlayer) ? this.engine.activePlayer.name : null
      };

      this.io.to(player.socketId).emit('gameStateUpdate', gameState);
    });
  }
}

module.exports = Room;