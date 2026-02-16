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
    const cardIndex = player.hand.findIndex(c => c.suit === card.suit && c.type === card.type);

    if (cardIndex === -1) {
        console.error("Érvénytelen kártya: Nincs a játékos kezében!");
        return; 
    }
    //PLAYER MOVES FIRST
    if (!this.boardCard) {
      const announcement = player.playAnnouncement(card, this.trumpSuit);
      if (announcement) {
        player.addRoundPoints(announcement.announcementValue);
        this.boardCard = announcement.playedCard;
      } else {
        this.boardCard = player.playCard(cardIndex);
        if (!this.boardCard) {
          //TODO: HANDLE ERROR
        }
      }
    } else { //PLAYER MOVES SECOND
      //TODO
    }
    
  }

  evaluateStrongerCard(){
    //TODO
  }
  
}

export default Engine;