import Card from './Card';

class Player {
  constructor(name){
    this.name = name;
    this.points = 0;
    this.hand = [];
  }

  drawCard(card) {
    if (this.hand.length >= 5) {
      throw new Error("Player has too many cards!");
    }

    this.hand.push(card);
  }

  addPoints(i) {
    this.points += i;
  }

  removeFromHand() {
    
  }

  doesPlayerHave20Or40(trumpSuit) {
    for (let i = 0; i < this.hand.length; i++) {
      if (this.hand[i].type === "Király" || this.hand[i].type === "Felső") {
        for (let j = i; j < array.length; j++) {          
          if (i !== j && this.hand[i].suit == this.hand[j].suit && (this.hand[j].type === "Felső" || this.hand[j].type === "Király")) {
            if (this.hand[j] === trumpSuit) {
              return 40;
            } else {
              return 20;
            }            
          }
        }
      }
    }
    return 0;
  }
}

export default Player;