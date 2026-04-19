const Engine = require('./Engine');
const Player = require('./Player');

class Room {
  constructor(roomId, player1Data, player2Data, io, onGameEnd) {
    this.roomId = roomId;
    this.io = io;
    this.onGameEnd = onGameEnd;

    const p1 = new Player(player1Data.name, player1Data.socketid);
    p1.userId = player1Data.playerId || null;
    const p2 = new Player(player2Data.name, player2Data.socketid);
    p2.userId = player2Data.playerId || null;
    this.engine = new Engine(p1, p2, this.io);
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

  handleSwitchTrumpCard(socketId) {
    let player = null;
    if (this.engine.player1.socketId === socketId) player = this.engine.player1;
    else if (this.engine.player2.socketId === socketId) player = this.engine.player2;

    if (!player) return;

    const result = this.engine.switchTrumpCard(player);

    if (result.success === true) {
      this.broadcastState();
    } else {
      this.io.to(socketId).emit('invalidSwitch', {
        message: result.message || "Szabálytalan aducsere!"
      });
    }
  }

  handleMove(socketId, cardData) {
    let player = null;
    if (this.engine.player1.socketId === socketId) player = this.engine.player1;
    else if (this.engine.player2.socketId === socketId) player = this.engine.player2;

    if (!player) return;

    const result = this.engine.handleMove(player, cardData);

    if (result && !result.success) {
      this.io.to(socketId).emit('invalidMove', {
        message: result.message
      });
      return;
    }

    if (result.isRoundOver) {
      this.broadcastState();

      if (result.isRoundOver.gameOver) {
        this.endMatch(result.isRoundOver.winner);

        return;
      }
    }

    this.broadcastState();

    if (result.winner && result.loser && this.engine.boardCard) {
      setTimeout(() => {
        this.engine.evaluateTrick(result.winner, [this.engine.secondBoardCard, this.engine.boardCard]);
        this.engine.boardCard = null;
        this.engine.secondBoardCard = null;
        this.engine.drawAfterTrick(result.winner, result.loser);

        const isRoundOver = this.engine.checkWinCondition(result.winner, result.loser);

        if (isRoundOver) {
          this.broadcastState();
          if (isRoundOver.gameOver === true) {
            this.endMatch(isRoundOver.winner)
          }
        } else {
          this.engine.activePlayer = result.winner;
          this.broadcastState();
        }
      }, 2000);
    }
  }

  endMatch(winner) {
    const matchLoser = winner === this.engine.player1 ? this.engine.player2 : this.engine.player1;

    this.io.to(winner.socketId).emit('matchEnded', { isWinner: true });
    this.io.to(matchLoser.socketId).emit('matchEnded', { isWinner: false });

    if (this.onGameEnd) {
      this.onGameEnd(this.roomId, winner, matchLoser);
    }
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
        wonCards: player.wonCards,

        enemyName: opponent.name,
        enemyHandCount: opponent.hand.length,
        enemyPoints: opponent.roundPoints,
        enemyGamePoints: opponent.gamePoints,

        boardCard: this.engine.boardCard,
        secondBoardCard: this.engine.secondBoardCard,
        trumpCard: this.engine.trumpCard,
        trumpSuit: this.engine.trumpSuit,
        deckCount: this.engine.deck.cards.length,
        closedData: this.engine.closedData,

        activePlayerName: this.engine.activePlayer ? this.engine.activePlayer.name : null,
        isMyTurn: this.engine.activePlayer === player
      };

      this.io.to(player.socketId).emit('gameStateUpdate', gameState);
    });
  }
}

module.exports = Room;