const Card = require('../classes/Card');

describe('Card Class', () => {
  it('should instantiate correctly with given values', () => {
    const card = new Card('makk', 'asz', 11);
    
    expect(card.suit).toBe('makk');
    expect(card.type).toBe('asz');
    expect(card.value).toBe(11);
  });

  it('should correctly identify if it is a trump card', () => {
    const card = new Card('piros', 'tiz', 10);
    
    expect(card.isTrump('piros')).toBe(true);
    expect(card.isTrump('zold')).toBe(false);
    expect(card.isTrump('makk')).toBe(false);
  });
});