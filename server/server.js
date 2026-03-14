const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const Room = require('./classes/Room');
require('dotenv').config();
const db = require('./models');

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

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, '..', 'client', 'dist');

const rooms = {};
const queue = [];
const playerNames = new Set();

io.on('connection', (socket) => {
  console.log('Egy felhasználó csatlakozott:', socket.id);

  socket.on('joinQueue', (name) => {
    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
      socket.data.roomId = null;
    }

    if (playerNames.has(name) && socket.data.username !== name) {
      socket.emit('error', 'Ez a név már foglalt!');
      return;
    }

    if (!playerNames.has(name)) {
      playerNames.add(name);
      socket.data.username = name;
    }

    const isAlreadyInQueue = queue.some(p => p.socketid === socket.id);
    if (!isAlreadyInQueue) {
      queue.push({
        'name': name,
        'socketid': socket.id
      });
    }

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

        const newGameRoom = new Room(roomId, p1, p2, io, (finishedRoomId) => {
          console.log(`Játék véget ért a ${finishedRoomId} szobában, törlés a memóriából.`);
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

  socket.on('disconnect', () => {
    console.log('Felhasználó kilépett', socket.id);

    const name = socket.data.username;
    const roomId = socket.data.roomId;

    if (roomId && rooms[roomId]) {
      console.log(`Játék leáll ${roomId} szobában (játékos kilépett).`);

      io.to(roomId).emit('matchEnded', { isWinner: true, msg: 'Kilépett az ellenfél!' });

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
    console.error('Hiba az adatbázis szinkronizációja során:', err);
  });