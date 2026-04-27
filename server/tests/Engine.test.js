const Engine = require('../classes/Engine');
const Player = require('../classes/Player');
const Card = require('../classes/Card');

describe('Engine Class', () => {
  let player1;
  let player2;
  let ioMock;
  let engine;

  beforeEach(() => {
    player1 = new Player('Player1', 'socket1');
    player2 = new Player('Player2', 'socket2');
    
    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };

    engine = new Engine(player1, player2, ioMock);
  });

  it('should initialize correctly', () => {
    expect(engine.player1).toBe(player1);
    expect(engine.player2).toBe(player2);
    expect(engine.closedData).toBeNull();
    expect(engine.activePlayer).toBeNull();
  });

  it('should start a round, deal cards, and set trump', () => {
    engine.startRound();

    expect(player1.hand.length).toBe(5);
    expect(player2.hand.length).toBe(5);
    expect(engine.deck.cards.length).toBe(9); 
    expect(engine.trumpCard).not.toBeNull();
    expect(engine.trumpSuit).toBe(engine.trumpCard.suit);
    expect(engine.activePlayer).toBe(player1);
  });

  it('should switch active player at the start of a new round', () => {
    engine.startRound();
    expect(engine.activePlayer).toBe(player1);

    engine.startRound();
    expect(engine.activePlayer).toBe(player2);
  });

  it('should successfully switch trump card if player has the *also* and is active', () => {
    engine.startRound();
    
    const alsoCard = new Card(engine.trumpSuit, 'also', 2);
    engine.activePlayer.hand[0] = alsoCard; 
    
    const originalTrumpCard = engine.trumpCard;

    const result = engine.switchTrumpCard(engine.activePlayer);

    expect(result.success).toBe(true);
    expect(engine.activePlayer.hand).toContain(originalTrumpCard);
    expect(engine.trumpCard).toBe(alsoCard);
    expect(engine.activePlayer.hand).not.toContain(alsoCard);
  });

  it('should fail to switch trump card if round is closed', () => {
    engine.startRound();
    engine.close(engine.activePlayer);
    
    const result = engine.switchTrumpCard(engine.activePlayer);

    expect(result.success).toBe(false);
  });

  it('should evaluate the stronger card correctly', () => {
    engine.trumpSuit = 'piros';

    const card1 = new Card('makk', 'tiz', 10);
    const card2 = new Card('makk', 'asz', 11);
    expect(engine.evaluateStrongerCard(card1, card2)).toBe(card2); 

    const card3 = new Card('zold', 'tiz', 10);
    const card4 = new Card('makk', 'asz', 11);
    expect(engine.evaluateStrongerCard(card3, card4)).toBe(card3); 

    const card5 = new Card('zold', 'asz', 11);
    const card6 = new Card('piros', 'also', 2);
    expect(engine.evaluateStrongerCard(card5, card6)).toBe(card6); 
  });

  it('should allow any move if deck is not empty and not closed', () => {
    engine.startRound();
    
    const ledCard = new Card('makk', 'tiz', 10);
    const cardToPlay = new Card('zold', 'asz', 11);
    
    expect(engine.isValidMove(player2, cardToPlay, ledCard)).toBe(true);
  });

  it('should enforce suit and overtrump rules when deck is closed', () => {
    engine.startRound();
    engine.close(engine.activePlayer); 
    
    const ledCard = new Card('makk', 'kiraly', 4);
    
    player2.hand = [
      new Card('zold', 'asz', 11),
      new Card('makk', 'tiz', 10),
      new Card('makk', 'also', 2) 
    ];

    expect(engine.isValidMove(player2, player2.hand[0], ledCard)).toBe(false);
    expect(engine.isValidMove(player2, player2.hand[2], ledCard)).toBe(false);
    expect(engine.isValidMove(player2, player2.hand[1], ledCard)).toBe(true);
  });

  it('should enforce trump rule when deck is closed and player lacks the led suit', () => {
    engine.startRound();
    engine.close(engine.activePlayer);
    engine.trumpSuit = 'piros';
    
    const ledCard = new Card('makk', 'kiraly', 4);
    
    player2.hand = [
      new Card('zold', 'asz', 11),
      new Card('piros', 'also', 2) 
    ];

    expect(engine.isValidMove(player2, player2.hand[0], ledCard)).toBe(false);
    expect(engine.isValidMove(player2, player2.hand[1], ledCard)).toBe(true);
  });

  it('should correctly set closedData when close is called with enough cards', () => {
    engine.startRound();
    player2.roundPoints = 15;
    
    engine.close(player1);

    expect(engine.closedData).not.toBeNull();
    expect(engine.closedData.closingPlayer).toBe(player1);
    expect(engine.closedData.enemyPointsAtClose).toBe(15);
  });

  it('should calculate match points correctly for standard wins', () => {
    player2.roundPoints = 0;
    expect(engine.calculateMatchPoints(player1, player2, false)).toBe(3);

    player2.roundPoints = 15;
    expect(engine.calculateMatchPoints(player1, player2, false)).toBe(2);

    player2.roundPoints = 40;
    expect(engine.calculateMatchPoints(player1, player2, false)).toBe(1);
  });

  it('should calculate match points correctly when closing player wins', () => {
    engine.startRound();
    
    player1.roundPoints = 66;
    player2.roundPoints = 40; 
    
    engine.closedData = {
      closingPlayer: player1,
      enemyPointsAtClose: 15 
    };

    expect(engine.calculateMatchPoints(player1, player2, false)).toBe(2);
  });

it('should penalize the closing player if they lose', () => {
    engine.startRound();
    
    engine.closedData = {
      closingPlayer: player1,
      enemyPointsAtClose: 15
    };

    player2.roundPoints = 66; 

    player1.roundPoints = 10;
    expect(engine.calculateMatchPoints(player2, player1, false)).toBe(2);

    player1.roundPoints = 0;
    expect(engine.calculateMatchPoints(player2, player1, false)).toBe(3);
  });

  it('should handle end round and detect game over', () => {
    engine.startRound();
    player2.roundPoints = 0; 
    
    const result = engine.endRound(player1, player2, false);

    expect(result.pointsAdded).toBe(3);
    expect(player1.gamePoints).toBe(3);
    expect(result.gameOver).toBe(false);
    expect(engine.closedData).toBe(false);

    player1.gamePoints = 5; 
    player2.roundPoints = 10; 
    
    const finalResult = engine.endRound(player1, player2, false);
    
    expect(finalResult.pointsAdded).toBe(2);
    expect(player1.gamePoints).toBe(7);
    expect(finalResult.gameOver).toBe(true);
  });
});