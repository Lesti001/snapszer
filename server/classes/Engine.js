import Deck from './Deck';
import Player from './Player';

class Engine {
  constructor(player1, player2){
    this.player1 = player1;
    this.player2 = player2;
    this.trumpSuit = null;
    this.deck = new Deck();
    this.isClosed = false;
    this.trumpCard;
    this.boardCard = null;
    this.activePlayer = null;
    this.lastRoundStartingPlayer = null;
  }

  startRound(){
    this.player1.clearHand();
    this.player2.clearHand();

    this.player1.resetRoundPoints();
    this.player2.resetRoundPoints();

    this.deck.generate();
    this.deck.shuffle();

    //DEAL INITIAL CARDS
    for (let i = 0; i < 5; i++) {
      this.player1.drawCard(this.deck.drawCard());
      this.player2.drawCard(this.deck.drawCard());
    }

    this.trumpCard = this.deck.drawCard();
    this.trumpSuit = this.trumpCard.suit;

    if (!this.lastRoundStartingPlayer) {
      this.activePlayer = this.player1; 
      this.lastRoundStartingPlayer = this.player1;
    } else {
      if (this.player1 === this.lastRoundStartingPlayer) {
        this.activePlayer = this.player2;
        this.lastRoundStartingPlayer = this.player2;
      } else {
        this.activePlayer = this.player1;
        this.lastRoundStartingPlayer = this.player1;
      }
    }  
  }


  handleMove(player, card){
    if (player !== this.activePlayer) {
      return { success: false, message: "Nem te következel!" };
    }

    const cardIndex = player.hand.findIndex(c => c.suit === card.suit && c.type === card.type);

    if (cardIndex === -1) {
        console.error("Érvénytelen kártya: Nincs a játékos kezében!");
        return {success: false, message: "A kártya nincs a kezedben!"};
    }
    //PLAYER MOVES FIRST
    if (!this.boardCard) {
      const announcement = player.playAnnouncement(card, this.trumpSuit);
      if (announcement) {//ANNOUNCEMENT IS BEING PLAYED
        player.addRoundPoints(announcement.announcementValue);
        
        //IF THE PLAYER WINS THE ROUND WITH THE ANNOUNCEMENT
        const winResult = this.checkWinCondition(player, (player === this.player1 ? this.player2 : this.player1));
        if (winResult) {
          return { success: true };//PLAYER WON
        }

        this.boardCard = announcement.playedCard;
      } else {
        this.boardCard = player.removeCard(cardIndex);
      }

      this.activePlayer = (player === this.player1) ? this.player2 : this.player1;

      return { success: true };
    } else { //PLAYER MOVES SECOND
      const cardInHand = player.hand[cardIndex];

      if (!this.isValidMove(player, cardInHand, this.boardCard)) {
        console.error("Szabálytalan lépés! (Szín/Adu/Ütés kényszer)");
        return { success: false, message: "Szabálytalan lépés! (Színkényszer vagy Ütéskényszer)" };
      }

      const playedCard = player.removeCard(cardIndex);

      const winningCard = this.evaluateStrongerCard(this.boardCard, playedCard);

      const trickPoints = this.boardCard.value + playedCard.value;

      let winner, loser;

      if (winningCard === playedCard) {
        winner = player;
        loser = (player === this.player1) ? this.player2 : this.player1;
      } else {
        winner = (player === this.player1) ? this.player2 : this.player1;
        loser = player;
      }

      winner.addRoundPoints(trickPoints);

      const winResult = this.checkWinCondition(winner, loser);
      if (winResult) return;

      if (!this.deck.isEmpty() && !this.isClosed) {
        if (!this.deck.isEmpty()) winner.drawCard(this.deck.drawCard());
        if (!this.deck.isEmpty()) {
          loser.drawCard(this.deck.drawCard());
        } else if (this.trumpCard) {
          loser.drawCard(this.trumpCard);
          this.trumpCard = null;          
        }
      }
      this.boardCard = null;
      this.activePlayer = winner;

      return { success: true };
    }
  }

  evaluateStrongerCard(ledCard, followedCard){
    if (ledCard.suit === followedCard.suit) {
      return followedCard.value > ledCard.value ? followedCard : ledCard;
    }

    if (followedCard.suit === this.trumpSuit) {
      return followedCard;
    }

    return ledCard;
  }
 
  isValidMove(player, cardToPlay, ledCard){
    if (!this.deck.isEmpty() && !this.isClosed) {
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

    if (player.hasTrump(this.trumpSuit)) {//PLAYER IS FORCED TO USE TRUMP SUIT IF THE PLAYER HAS NO CARD OF SUIT THAT IS THE LEDCARD
      if (cardToPlay.suit !== this.trumpSuit) {
        return false;
      }

      return true;
    }

    return true;
  }

  checkWinCondition(winner, loser){
    if (winner.roundPoints >= 66) {
      return this.endRound(winner, loser);
    }

    if (this.deck.isEmpty() && this.player1.hand.length === 0 && this.player2.hand.length === 0) {
      return this.endRound(winner, loser, true);
    }

    return null;
  }

  endRound(winner, loser, isLastTrickWin = false) {
    let matchPoints = 0;

    if (isLastTrickWin) {
      matchPoints = 1;
    } else {
      if (loser.roundPoints === 0) {
        matchPoints = 3;
      } else if (loser.roundPoints < 33) {
        matchPoints = 2;
      } else {
        matchPoints = 1;
      }
    }

    winner.gamePoints += matchPoints;

    console.log(`KÖR VÉGE! Győztes: ${winner.name}, Kapott meccspont: ${matchPoints}`);
    console.log(`Állás: ${this.player1.name}: ${this.player1.gamePoints} - ${this.player2.name}: ${this.player2.gamePoints}`);

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

export default Engine;