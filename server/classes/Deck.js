const Card = require('./Card');

class Deck {
  constructor() {
    this.cards = [];
  }

  generate() {
    this.cards = [];

    const suits = ["Piros", "Tök", "Zöld", "Makk"];
    const types = [
      { name: "Ász", value: 11 },
      { name: "Tízes", value: 10 },
      { name: "Király", value: 4 },
      { name: "Felső", value: 3 },
      { name: "Alsó", value: 2 }
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