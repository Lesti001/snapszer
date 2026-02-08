const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Élesben érdemes korlátozni a kliens URL-jére
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
    if (playerNames.has(name)) {
      socket.emit('error', 'Ez a név már foglalt!');
      socket.disconnect();
      return;
    }

    playerNames.add(name);
    socket.data.username = name;
    queue.push({
      'name': name,
      'socketid': socket.id
    });

    //Creating rooms whenever 2 players are searching
    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      const socket1 = io.sockets.sockets.get(p1.socketid);
      const socket2 = io.sockets.sockets.get(p2.socketid);

      if (socket1 && socket2) {
        const roomId = `room_${p1.socketid}_${p2.socketid}`;

        socket1.join(roomId);
        socket2.join(roomId);

        socket1.data.roomId = roomId;
        socket2.data.roomId = roomId;

        rooms[roomId] = {
          id: roomId,
          players: [p1, p2],
          state: 'STARTING'
        }

        io.to(roomId).emit('gameStart', {
          roomId: roomId,
          players: [p1.name, p2.name],
          message: 'A játék indul!'
        })
      } else {
        if (socket1) queue.unshift(p1);
        if (socket2) queue.unshift(p2);
      }


    }

    console.log(queue);
    console.log('Játékos keres:', name);
  });

  socket.on('disconnect', () => {
    console.log('Felhasználó kilépett', socket.id);

    const name = socket.data.username;

    const queueIndex = queue.findIndex(p => p.socketid === socket.id);

    if (queueIndex != -1) {
      queue.splice(queueIndex, 1);
      console.log('Játékos eltávolítva a várólistából.');
      console.log(queue);
    }

    if (name) {
      playerNames.delete(name);

      console.log(`Felhasználó kilépett és törölve: ${name}`);
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

httpServer.listen(PORT, () => {
  console.log(`Szerver és Socket.io fut a ${PORT} porton`);
});