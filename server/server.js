const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Room = require('./classes/Room');
require('dotenv').config();
const db = require('./models');
const authController = require('./controllers/authController');
const statsController = require('./controllers/statsController');
const { logMatchSearch } = require('./utils/logger');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/stats', statsController.getStats);

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, '..', 'client', 'dist');

const rooms = {};
const queue = [];
const playerNames = new Set();

io.on('connection', (socket) => {
  console.log('Egy felhasználó csatlakozott:', socket.id);

  socket.on('joinQueue', async (payload) => {
    const name = typeof payload === 'string' ? payload : payload.name;
    const token = typeof payload === 'string' ? null : payload.token;

    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
      socket.data.roomId = null;
    }

    let isAuthenticated = false;
    let playerId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.username === name) {
          isAuthenticated = true;
          playerId = decoded.playerId;
        } else {
          logMatchSearch(name, false, 'Hibás token és név párosítás');
          return socket.emit('error', 'Érvénytelen munkamenet!');
        }
      } catch (err) {
        logMatchSearch(name, false, 'Lejárt vagy érvénytelen JWT token');
        return socket.emit('error', 'Érvénytelen vagy lejárt munkamenet! Jelentkezz be újra.');
      }
    }

    if (!isAuthenticated) {
      try {
        const existingPlayer = await db.Player.findOne({ where: { username: name } });
        if (existingPlayer) {
          logMatchSearch(name, false, 'Regisztrált nevet próbált használni vendégként');
          return socket.emit('error', 'Ez a név foglalt!');
        }
      } catch (error) {
        console.error("Adatbázis hiba:", error);
        logMatchSearch(name, false, 'Adatbázis hiba a név ellenőrzésekor');
        return socket.emit('error', 'Szerverhiba történt a név ellenőrzésekor.');
      }
    }

    if (playerNames.has(name) && socket.data.username !== name) {
      socket.emit('error', 'Ez a név jelenleg már játszik a szerveren!');
      logMatchSearch(name, false, 'A név már aktív a szerveren');
      return;
    }

    if (!playerNames.has(name)) {
      playerNames.add(name);
      socket.data.username = name;

      socket.data.isAuthenticated = isAuthenticated;
      socket.data.playerId = playerId;
    }

    const isAlreadyInQueue = queue.some(p => p.socketid === socket.id);
    if (!isAlreadyInQueue) {
      queue.push({
        'name': name,
        'socketid': socket.id,
        'playerId': playerId
      });
    }

    logMatchSearch(name, true);

    console.log('Játékos keres:', name);
    console.log('Jelenlegi várólista:', queue.map(p => p.name));

    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      const socket1 = io.sockets.sockets.get(p1.socketid);
      const socket2 = io.sockets.sockets.get(p2.socketid);

      if (socket1 && socket2) {
        const roomId = `room_${Date.now()}_${p1.socketid}_${p2.socketid}`;

        socket1.join(roomId);
        socket2.join(roomId);

        socket1.data.roomId = roomId;
        socket2.data.roomId = roomId;

        const newGameRoom = new Room(roomId, p1, p2, io, async (finishedRoomId, winner, loser) => {
          console.log(`Játék véget ért a ${finishedRoomId} szobában, törlés a memóriából.`);

          if (winner && loser) {
            try {
              if (winner.userId) {
                await db.History.create({
                  player_id: winner.userId,
                  opponent_name: loser.name,
                  match_status: 'WON',
                  final_score: winner.gamePoints !== undefined ? `${winner.gamePoints} - ${loser.gamePoints}` : 'Kilépett'
                });

                const wPoints = Number(winner.gamePoints) || 0;
                const winnerStats = await db.Stats.findOne({ where: { player_id: winner.userId } });

                if (winnerStats) {
                  winnerStats.total_wins += 1;
                  winnerStats.total_games += 1;
                  winnerStats.total_points += wPoints;
                  await winnerStats.save();
                } else {
                  await db.Stats.create({
                    player_id: winner.userId,
                    total_wins: 1,
                    total_games: 1,
                    total_points: wPoints
                  });
                }
              }

              if (loser.userId) {
                await db.History.create({
                  player_id: loser.userId,
                  opponent_name: winner.name,
                  match_status: 'LOST',
                  final_score: loser.gamePoints !== undefined ? `${loser.gamePoints} - ${winner.gamePoints}` : 'Kilépett'
                });

                const lPoints = Number(loser.gamePoints) || 0;
                const loserStats = await db.Stats.findOne({ where: { player_id: loser.userId } });

                if (loserStats) {
                  loserStats.total_games += 1;
                  loserStats.total_points += lPoints;
                  await loserStats.save();
                } else {
                  await db.Stats.create({
                    player_id: loser.userId,
                    total_wins: 0,
                    total_games: 1,
                    total_points: lPoints
                  });
                }
              }
            } catch (err) {
              console.error(err);
            }
          }

          delete rooms[finishedRoomId];

          const clients = io.sockets.adapter.rooms.get(finishedRoomId);
          if (clients) {
            for (const clientId of [...clients]) {
              const clientSocket = io.sockets.sockets.get(clientId);
              if (clientSocket) {
                clientSocket.disconnect(true);
              }
            }
          }
        });

        rooms[roomId] = newGameRoom;
        console.log(`Szoba létrehozva: ${roomId} (${p1.name} vs ${p2.name})`);

        newGameRoom.startGame();
      } else {
        if (socket1) queue.unshift(p1);
        if (socket2) queue.unshift(p2);
      }
    }
  });

  socket.on('playerMove', (cardData) => {
    const roomId = socket.data.roomId;

    if (roomId && rooms[roomId]) {
      rooms[roomId].handleMove(socket.id, cardData);
    } else {
      socket.emit('error', 'Nincs aktív játék!');
    }
  });

  socket.on('switchTrumpCard', () => {
    const roomId = socket.data.roomId;

    if (roomId && rooms[roomId]) {
      rooms[roomId].handleSwitchTrumpCard(socket.id);
    } else {
      socket.emit('error', 'Nincs aktív játék!');
    }
  });

  socket.on('requestGameState', () => {
    const roomId = socket.data.roomId;

    if (roomId && rooms[roomId]) {
      rooms[roomId].broadcastState();
    }
  });

  socket.on('disconnect', async () => {
    console.log('Felhasználó kilépett', socket.id);

    const name = socket.data.username;
    const roomId = socket.data.roomId;

    if (roomId && rooms[roomId]) {
      console.log(`Játék leáll ${roomId} szobában (játékos kilépett).`);

      io.to(roomId).emit('matchEnded', { isWinner: true, msg: 'Kilépett az ellenfél!' });

      const roomObj = rooms[roomId];
      let winner = null;
      let loser = null;

      if (roomObj.engine.player1.socketId === socket.id) {
        loser = roomObj.engine.player1;
        winner = roomObj.engine.player2;
      } else {
        loser = roomObj.engine.player2;
        winner = roomObj.engine.player1;
      }

      try {
        if (winner && winner.userId) {
          await db.History.create({
            player_id: winner.userId,
            opponent_name: loser.name,
            match_status: 'WON',
            final_score: 'Kilépett'
          });

          const wPoints = Number(winner.gamePoints) || 0;
          const winnerStats = await db.Stats.findOne({ where: { player_id: winner.userId } });

          if (winnerStats) {
            winnerStats.total_wins += 1;
            winnerStats.total_games += 1;
            winnerStats.total_points += wPoints;
            await winnerStats.save();
          } else {
            await db.Stats.create({
              player_id: winner.userId,
              total_wins: 1,
              total_games: 1,
              total_points: wPoints
            });
          }
        }

        if (loser && loser.userId) {
          await db.History.create({
            player_id: loser.userId,
            opponent_name: winner.name,
            match_status: 'LOST',
            final_score: 'Kilépett'
          });

          const lPoints = Number(loser.gamePoints) || 0;
          const loserStats = await db.Stats.findOne({ where: { player_id: loser.userId } });

          if (loserStats) {
            loserStats.total_games += 1;
            loserStats.total_points += lPoints;
            await loserStats.save();
          } else {
            await db.Stats.create({
              player_id: loser.userId,
              total_wins: 0,
              total_games: 1,
              total_points: lPoints
            });
          }
        }
      } catch (err) {
        console.error(err);
      }

      delete rooms[roomId];

      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients) {
        for (const clientId of [...clients]) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket) {
            clientSocket.disconnect(true);
          }
        }
      }
    }

    const queueIndex = queue.findIndex(p => p.socketid === socket.id);

    if (queueIndex != -1) {
      queue.splice(queueIndex, 1);
      console.log('Játékos eltávolítva a várólistából.');
      console.log('Jelenlegi várólista:', queue.map(p => p.name));
    }

    if (name) {
      playerNames.delete(name);
      console.log(`Felhasználó név felszabadítva: ${name}`);
    } else {
      console.log('Ismeretlen (név nélküli) socket lépett ki.');
    }
  });
});

app.use((req, res, next) => {
  if (req.url.startsWith('/snapszer-app')) {
    req.url = req.url.replace('/snapszer-app', '') || '/';
  }
  next();
});

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map|.svg)$/i.test(req.path)) {
    next();
  } else {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Adatbázis sikeresen szinkronizálva.');

    httpServer.listen(PORT, () => {
      console.log(`Szerver és Socket.io fut a ${PORT} porton`);
    });
  })
  .catch((err) => {
    console.error(err);
  });