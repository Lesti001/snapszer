const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { createServer } = require('node:http'); // Új: natív HTTP szerver modul
const { Server } = require('socket.io');     // Új: Socket.io modul
require('dotenv').config();

const app = express();
const httpServer = createServer(app); // Az Express app becsomagolása
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

// --- Socket.io eseménykezelők ---
io.on('connection', (socket) => {
    console.log('Egy felhasználó csatlakozott:', socket.id);

    socket.on('üzenet', (data) => {
        console.log('Üzenet érkezett:', data);
        // Küldés mindenkinek
        io.emit('valasz', { msg: 'Szerver vette az adást!' });
    });

    socket.on('disconnect', () => {
        console.log('Felhasználó kilépett');
    });
});

// --- Middleware-ek és statikus fájlok ---
app.use((req, res, next) => {
    if (req.url.startsWith('/snapszer-app')) {
        req.url = req.url.replace('/snapszer-app', '') || '/';
    }
    next();
});

// Statikus fájlok kiszolgálása (FONTOS: ez kerüljön az index.html fallback elé)
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

// FONTOS: httpServer-t indítjuk, nem az app-ot!
httpServer.listen(PORT, () => {
    console.log(`Szerver és Socket.io fut a ${PORT} porton`);
});