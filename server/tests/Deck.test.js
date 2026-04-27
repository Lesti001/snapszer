const Deck = require('../classes/Deck');
const Card = require('../classes/Card');

describe('Deck Class', () => {
  let deck;

  beforeEach(() => {
    deck = new Deck();
  });

  it('should be empty upon creation', () => {
    expect(deck.cards.length).toBe(0);
    expect(deck.isEmpty()).toBe(true);
  });

  it('should generate exactly 20 cards', () => {
    deck.generate();
    
    expect(deck.cards.length).toBe(20);
    expect(deck.cards[0] instanceof Card).toBe(true);
  });

  it('should draw a card and decrease the deck size', () => {
    deck.generate();
    const initialSize = deck.cards.length;
    const topCard = deck.cards[deck.cards.length - 1]; 
    
    const drawnCard = deck.drawCard();
    
    expect(drawnCard).toEqual(topCard);
    expect(deck.cards.length).toBe(initialSize - 1);
  });

  it('should return true for isEmpty() when all cards are drawn', () => {
    deck.generate();
    expect(deck.isEmpty()).toBe(false);

    for (let i = 0; i < 20; i++) {
      deck.drawCard();
    }

    expect(deck.isEmpty()).toBe(true);
  });

  it('should shuffle the cards while maintaining the same deck size', () => {
    deck.generate();
    
    deck.shuffle();
    
    expect(deck.cards.length).toBe(20);
  });

  it('should be different cards on top after shuffle', () => {
    deck.generate();

    const lastFive = deck.cards.slice(-5);

    deck.shuffle();

    expect(deck.cards.slice(-5)).not.toEqual(lastFive);
  });
});