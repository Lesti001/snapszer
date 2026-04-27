const Player = require('../classes/Player');
const Card = require('../classes/Card');

describe('Player Class', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer', 'socket123');
  });

  it('should initialize with correct default values', () => {
    expect(player.name).toBe('TestPlayer');
    expect(player.socketId).toBe('socket123');
    expect(player.roundPoints).toBe(0);
    expect(player.gamePoints).toBe(0);
    expect(player.hand).toEqual([]);
    expect(player.wonCards).toEqual([]);
  });

  it('should add a card to hand when drawCard is called', () => {
    const card = new Card('piros', 'asz', 11);
    player.drawCard(card);
    
    expect(player.hand.length).toBe(1);
    expect(player.hand[0]).toEqual(card);
  });

  it('should add and reset round points', () => {
    player.addRoundPoints(10);
    player.addRoundPoints(12);
    expect(player.roundPoints).toBe(22);

    player.resetRoundPoints();
    expect(player.roundPoints).toBe(0);
  });

  it('should clear hand', () => {
    player.drawCard(new Card('makk', 'asz', 11));
    player.drawCard(new Card('makk', 'tiz', 10));
    
    player.clearHand();
    expect(player.hand.length).toBe(0);
  });

  it('should clear won cards', () => {
    const card1 = new Card('makk', 'asz', 11);
    const card2 = new Card('makk', 'tiz', 10);
    
    player.addCardsToWonCards([card1, card2]);
    player.clearWonCards();
    
    expect(player.wonCards.length).toBe(0);
  });

  it('should add exactly two cards to wonCards', () => {
    const card1 = new Card('makk', 'asz', 11);
    const card2 = new Card('makk', 'tiz', 10);
    
    player.addCardsToWonCards([card1, card2]);
    expect(player.wonCards.length).toBe(2);
    expect(player.wonCards).toContain(card1);
    expect(player.wonCards).toContain(card2);
  });

  it('should throw an error when adding invalid cards to wonCards', () => {
    expect(() => {
      player.addCardsToWonCards([]);
    }).toThrow("No cards to add to wonCards!");
  });

  it('should remove a card from hand by index', () => {
    const card1 = new Card('makk', 'asz', 11);
    const card2 = new Card('makk', 'tiz', 10);
    player.drawCard(card1);
    player.drawCard(card2);
    
    const removedCard = player.removeCard(0);
    
    expect(removedCard).toEqual(card1);
    expect(player.hand.length).toBe(1);
    expect(player.hand[0]).toEqual(card2);
  });

  it('should return a 20 point announcement for a normal suit', () => {
    const king = new Card('piros', 'kiraly', 4);
    const upper = new Card('piros', 'felso', 3);
    player.drawCard(king);
    player.drawCard(upper);
    
    const announcements = player.getAnnouncements('makk');
    
    expect(announcements.length).toBe(1);
    expect(announcements[0].value).toBe(20);
    expect(announcements[0].suit).toBe('piros');
    expect(announcements[0].cards).toContain(king);
    expect(announcements[0].cards).toContain(upper);
  });

  it('should return a 40 point announcement for the trump suit', () => {
    const king = new Card('makk', 'kiraly', 4);
    const upper = new Card('makk', 'felso', 3);
    player.drawCard(king);
    player.drawCard(upper);
    
    const announcements = player.getAnnouncements('makk');
    
    expect(announcements.length).toBe(1);
    expect(announcements[0].value).toBe(40);
  });

  it('should return an empty array if no announcements are possible', () => {
    player.drawCard(new Card('makk', 'kiraly', 4));
    player.drawCard(new Card('zold', 'felso', 3));
    
    const announcements = player.getAnnouncements('makk');
    expect(announcements.length).toBe(0);
  });

  it('should successfully play a valid announcement and return the value and the played card', () => {
    const king = new Card('zold', 'kiraly', 4);
    const upper = new Card('zold', 'felso', 3);
    player.drawCard(king);
    player.drawCard(upper);
    player.drawCard(new Card('piros', 'asz', 11));
    
    const result = player.playAnnouncement(king, 'makk');
    
    expect(result).not.toBeNull();
    expect(result.announcementValue).toBe(20);
    expect(result.playedCard).toEqual(king);
    expect(player.hand.length).toBe(2);
    expect(player.hand).not.toContain(king);
  });

  it('should return null when trying to play an invalid announcement', () => {
    const king = new Card('zold', 'kiraly', 4);
    player.drawCard(king);
    player.drawCard(new Card('piros', 'felso', 3));
    
    const result = player.playAnnouncement(king, 'makk');
    expect(result).toBeNull();
  });

  it('should correctly identify if the player has a specific suit', () => {
    player.drawCard(new Card('tok', 'asz', 11));
    
    expect(player.hasSuit('tok')).toBe(true);
    expect(player.hasSuit('makk')).toBe(false);
  });

  it('should correctly identify if the player has a trump card', () => {
    player.drawCard(new Card('piros', 'asz', 11));
    player.drawCard(new Card('zold', 'tiz', 10));
    
    expect(player.hasTrump('piros')).toBe(true);
    expect(player.hasTrump('makk')).toBe(false);
  });

  it('should correctly identify if the player has a stronger card of a given suit', () => {
    player.drawCard(new Card('zold', 'tiz', 10));
    player.drawCard(new Card('makk', 'kiraly', 4));
    
    expect(player.hasStrongerCard('zold', 4)).toBe(true);
    expect(player.hasStrongerCard('zold', 10)).toBe(false);
    expect(player.hasStrongerCard('zold', 11)).toBe(false);
    expect(player.hasStrongerCard('makk', 2)).toBe(true);
    expect(player.hasStrongerCard('makk', 4)).toBe(false);
    expect(player.hasStrongerCard('makk', 10)).toBe(false);
  });
});