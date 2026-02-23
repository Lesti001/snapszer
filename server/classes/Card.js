class Card {
  constructor(suit, type, value) {
    this.suit = suit;
    this.type = type;
    this.value = value;
  }
  isTrump(trumpSuit){
    return this.suit === trumpSuit;
  }
}

module.exports = Card;