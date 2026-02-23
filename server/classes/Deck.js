const Card = require('./Card');

class Deck {
  constructor() {
    this.cards = [];
  }

  generate() {
    this.cards = [];

    const suits = ["piros", "tok", "zold", "makk"];
    
    const types = [
      { name: "asz", value: 11 },
      { name: "tiz", value: 10 },
      { name: "kiraly", value: 4 },
      { name: "felso", value: 3 },
      { name: "also", value: 2 }
    ];

    for (let suit of suits) {
      for (let type of types) {
        this.cards.push(new Card(suit, type.name, type.value));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }

  drawCard() {
    return this.cards.pop();
  }

  isEmpty() {
    return this.cards.length === 0;
  }
}

module.exports = Deck;