const Card = require('./Card.js');

class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.roundPoints = 0;
    this.gamePoints = 0;
    this.hand = [];
    this.wonCards = [];
  }

  drawCard(card) {
    this.hand.push(card);
  }

  resetRoundPoints(){
    this.roundPoints = 0;
  }

  addRoundPoints(i) {
    this.roundPoints += i;
  }

  clearHand() {
    this.hand = [];
  }

  clearWonCards() {
    this.wonCards = [];
  }

  addCardsToWonCards(cards) {
    if (!cards[0] || !cards[1]) {
      throw new Error("No cards to add to wonCards!");
    } 

    this.wonCards.push(cards[0]);
    this.wonCards.push(cards[1]);
  }

  removeCard(index) {
    if (index < 0 || index >= this.hand.length) {
      throw new Error("Invalid card index");
    }

    const playedCard = this.hand.splice(index, 1)[0];
    return playedCard;
  }

  getAnnouncements(trumpSuit) {
    const announcements = [];
    const suits = ["piros", "tok", "zold", "makk"];

    for (const suit of suits) {
      const king = this.hand.find(c => c.suit === suit && c.type === "kiraly");
      const upper = this.hand.find(c => c.suit === suit && c.type === "felso");

      if (king && upper) {
        announcements.push({
          suit: suit,
          value: (suit === trumpSuit) ? 40 : 20,
          cards: [king, upper]
        });
      }
    }
    
    return announcements;
  }

  playAnnouncement(cardToPlay, trumpSuit) {
    const possibleAnnouncements = this.getAnnouncements(trumpSuit);

    const matchingAnnouncement = possibleAnnouncements.find(ann => 
      ann.suit === cardToPlay.suit && 
      (cardToPlay.type === "felso" || cardToPlay.type === "kiraly")
    );

    if (matchingAnnouncement) {
      const indexInHand = this.hand.findIndex(c => 
        c.suit === cardToPlay.suit && c.type === cardToPlay.type
      );

      if (indexInHand !== -1) {
        const playedCard = this.removeCard(indexInHand);

        return {
          playedCard: playedCard,
          announcementValue: matchingAnnouncement.value
        };
      }
    }

    return null;
  }
  
  hasSuit(suit) {
    return this.hand.some(c => c.suit === suit);
  }

  hasTrump(trumpSuit) {
    return this.hand.some(c => c.suit === trumpSuit);
  }

  hasStrongerCard(suit, valueToBeat) {
    return this.hand.some(c => c.suit === suit && c.value > valueToBeat);
  }
}

module.exports = Player;