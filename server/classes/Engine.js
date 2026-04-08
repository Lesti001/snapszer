const Deck = require('./Deck');
const Player = require('./Player');

class Engine {
  constructor(player1, player2, io) {
    this.player1 = player1;
    this.player2 = player2;
    this.trumpSuit = null;
    this.deck = new Deck();
    this.closedData = null; //Null if round is not closed
    this.trumpCard = null;
    this.boardCard = null;
    this.secondBoardCard = null;
    this.activePlayer = null;
    this.lastRoundStartingPlayer = null;
    this.io = io;
  }

  startRound() {
    this.boardCard = null;

    this.player1.clearHand();
    this.player2.clearHand();

    this.player1.resetRoundPoints();
    this.player2.resetRoundPoints();

    this.player1.clearWonCards();
    this.player2.clearWonCards();

    this.deck.generate();
    this.deck.shuffle();

    //DEAL INITIAL CARDS
    for (let i = 0; i < 5; i++) {
      this.player1.drawCard(this.deck.drawCard());
      this.player2.drawCard(this.deck.drawCard());
    }

    this.trumpCard = this.deck.drawCard();
    this.trumpSuit = this.trumpCard.suit;

    if (this.lastRoundStartingPlayer) {
      if (this.player1 === this.lastRoundStartingPlayer) {
        this.activePlayer = this.player2;
        this.lastRoundStartingPlayer = this.player2;
      } else {
        this.activePlayer = this.player1;
        this.lastRoundStartingPlayer = this.player1;
      }
    } else {
      this.activePlayer = this.player1;
      this.lastRoundStartingPlayer = this.player1;
    }
  }

  switchTrumpCard(player) {
    if (this.closedData) {
      return { success: false, message: "Takarás után nem cserélhetsz adut!" };
    }

    if (player && this.activePlayer === player) {
      const cardToSwitchIndex = player.hand.findIndex(item => (item.suit === this.trumpSuit && item.type === 'also'));

      if (cardToSwitchIndex !== -1 && this.trumpCard) {
        const cardToSwitch = player.removeCard(cardToSwitchIndex);
        player.hand.push(this.trumpCard);
        this.trumpCard = cardToSwitch;
        return { success: true };
      }
    }

    return { success: false };
  }

  handleFirstMove(player, cardIndex, card) {
    const announcement = player.playAnnouncement(card, this.trumpSuit);
    if (announcement) {//ANNOUNCEMENT IS BEING PLAYED
      player.addRoundPoints(announcement.announcementValue);

      this.io.to(this.player1.socketId).emit('announceMentMessage', {
        msg: `Játékos: ${player.name} ${announcement.announcementValue}-t játszott`,
        color: player === this.player1 ? 'blue' : 'orange'
      });

      this.io.to(this.player2.socketId).emit('announceMentMessage', {
        msg: `Játékos: ${player.name} ${announcement.announcementValue}-t játszott`,
        color: player === this.player2 ? 'blue' : 'orange'
      });

      //IF THE PLAYER WINS THE ROUND WITH THE ANNOUNCEMENT
      const winResult = this.checkWinCondition(player, (player === this.player1 ? this.player2 : this.player1));
      if (winResult) {
        return { success: true, isRoundOver: winResult };//PLAYER WON
      }

      this.boardCard = announcement.playedCard;
    } else {
      this.boardCard = player.removeCard(cardIndex);
    }

    this.activePlayer = (player === this.player1) ? this.player2 : this.player1;

    return { success: true };
  }

  handleSecondMove(player, cardIndex) {
    const cardInHand = player.hand[cardIndex];

    if (!this.isValidMove(player, cardInHand, this.boardCard)) {
      console.error("Szabálytalan lépés! (Szín/Adu/Ütés kényszer)");
      return { success: false, message: "Szabálytalan lépés! (Színkényszer vagy Ütéskényszer)" };
    }

    const playedCard = player.removeCard(cardIndex);
    this.secondBoardCard = playedCard;

    const winningCard = this.evaluateStrongerCard(this.boardCard, playedCard);
    const opponent = (player === this.player1) ? this.player2 : this.player1;

    const winner = (winningCard === playedCard) ? player : opponent;
    const loser = (winningCard === playedCard) ? opponent : player;

    this.activePlayer = null;

    return {
      success: true,
      winner: winner,
      loser: loser,
    };
  }

  handleMove(player, card) {
    if (player !== this.activePlayer) {
      return { success: false, message: "Nem te következel!" };
    }

    const cardIndex = player.hand.findIndex(c => c.suit === card.suit && c.type === card.type);

    if (cardIndex === -1) {
      console.error("Érvénytelen kártya: Nincs a játékos kezében!");
      return { success: false, message: "A kártya nincs a kezedben!" };
    }

    if (this.boardCard) {
      return this.handleSecondMove(player, cardIndex);
    } else {
      return this.handleFirstMove(player, cardIndex, card);
    }
  }

  evaluateTrick(player, cards) {
    if (!cards[0] || !cards[1]) {
      console.log("ERROR: no cards in evaluate trick");
      return;
    }

    const winningPoints = cards[0].value + cards[1].value;
    player.addRoundPoints(winningPoints);
    player.addCardsToWonCards(cards);
  }

  drawAfterTrick(winner, loser) {
    if (!this.deck.isEmpty() && !this.closedData) {
      if (!this.deck.isEmpty()) winner.drawCard(this.deck.drawCard());
      if (!this.deck.isEmpty()) {
        loser.drawCard(this.deck.drawCard());
      } else if (this.trumpCard) {
        loser.drawCard(this.trumpCard);
        this.trumpCard = null;
      }
    }
  }

  evaluateStrongerCard(ledCard, followedCard) {
    if (ledCard.suit === followedCard.suit) {
      return followedCard.value > ledCard.value ? followedCard : ledCard;
    }

    if (followedCard.suit === this.trumpSuit) {
      return followedCard;
    }

    return ledCard;
  }

  isValidMove(player, cardToPlay, ledCard) {
    if (!this.deck.isEmpty() && !this.closedData) {
      return true;
    }

    if (player.hasSuit(ledCard.suit)) {
      if (cardToPlay.suit !== ledCard.suit) {
        return false;
      }

      if (player.hasStrongerCard(ledCard.suit, ledCard.value)) {
        if (cardToPlay.value <= ledCard.value) {
          return false; //PLAYER IS FORCED TO USE STRONGER CARD IN THE SAME SUIT
        }
      }

      return true;
    }

    if (player.hasTrump(this.trumpSuit)) {//PLAYER IS FORCED TO USE TRUMP SUIT IF THE PLAYER HAS NO CARD OF SUIT THAT IS THE CARD ON THE BOARD
      if (cardToPlay.suit !== this.trumpSuit) {
        return false;
      }
    }

    return true;
  }

  checkWinCondition(winner, loser) {
    if (winner.roundPoints >= 66) {
      return this.endRound(winner, loser);
    }

    if (this.player1.hand.length === 0 && this.player2.hand.length === 0) {
      if (this.closedData) {
        const loserPlayer = this.closedData.closingPlayer;
        const winnerPlayer = loserPlayer === this.player1 ? this.player2 : this.player1;
        return this.endRound(winnerPlayer, loserPlayer, false);
      }

      return this.endRound(winner, loser, true);
    }

    return null;
  }

  close(player) {
    if (this.deck && this.deck.cards.length < 3) {
      return;
    }

    this.closedData = {
      closingPlayer: player,
      enemyPointsAtClose: player === this.player1 ? this.player2.roundPoints : this.player1.roundPoints
    }
  }

  calculateMatchPoints(winner, loser, isLastTrickWin) {
    if (this.closedData) {
      if (winner !== this.closedData.closingPlayer) {
        return loser.roundPoints === 0 ? 3 : 2;
      }

      const enemyPoints = this.closedData.enemyPointsAtClose;
      if (enemyPoints === 0) return 3;
      if (enemyPoints < 33) return 2;
      return 1;
    }

    if (isLastTrickWin) return 1;

    if (loser.roundPoints === 0) return 3;
    if (loser.roundPoints < 33) return 2;
    return 1;
  }

  endRound(winner, loser, isLastTrickWin = false) {
    let matchPoints = this.calculateMatchPoints(winner, loser, isLastTrickWin);

    winner.gamePoints += matchPoints;

    console.log(`KÖR VÉGE! Győztes: ${winner.name}, Kapott meccspont: ${matchPoints}`);
    console.log(`Állás: ${this.player1.name}: ${this.player1.gamePoints} - ${this.player2.name}: ${this.player2.gamePoints}`);

    this.closedData = false;

    this.startRound();

    if (winner.gamePoints >= 7) {
      console.log(`Vége a mecsnek! NYERT: ${winner.name}`);
    }

    return {
      winner: winner,
      pointsAdded: matchPoints,
      gameOver: winner.gamePoints >= 7
    };
  }
}

module.exports = Engine;