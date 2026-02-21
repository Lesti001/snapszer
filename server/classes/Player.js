const Card = require('./Card.js');

class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.roundPoints = 0;
    this.gamePoints = 0;
    this.hand = [];
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

  removeCard(index) {
    if (index < 0 || index >= this.hand.length) {
      throw new Error("Invalid card index");
    }

    const playedCard = this.hand.splice(index, 1)[0];
    return playedCard;
  }

  getAnnouncements(trumpSuit) {
    const announcements = [];
    const suits = ["Piros", "Tök", "Zöld", "Makk"];

    for (const suit of suits) {
      // Megkeressük a párokat
      const king = this.hand.find(c => c.suit === suit && c.type === "Király");
      const upper = this.hand.find(c => c.suit === suit && c.type === "Felső");

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
      (cardToPlay.type === "Király" || cardToPlay.type === "Felső")
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