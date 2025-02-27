// server.js
import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"]
  }
});

// Store player data
const players = {};

// Available shapes for players
const shapes = ['square', 'rectangle', 'triangle'];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Assign random shape to new player
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  
  // Generate random position within reasonable bounds
  const x = Math.floor(Math.random() * 800) + 50;
  const y = Math.floor(Math.random() * 500) + 50;
  
  // Random color for the player
  const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;

  // Create player data
  players[socket.id] = {
    id: socket.id,
    x,
    y,
    shape,
    color,
    username: `Player-${nanoid(6)}`
  };

  // Send the current state to new player
  socket.emit('gameState', players);
  
  // Notify others of new player
  socket.broadcast.emit('playerJoined', players[socket.id]);

  // Handle player movement
  socket.on('playerMove', (position) => {
    if (players[socket.id]) {
      players[socket.id].x = position.x;
      players[socket.id].y = position.y;
      
      // Broadcast player movement to all other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: position.x,
        y: position.y
      });
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    if (players[socket.id]) {
      io.emit('newMessage', {
        id: socket.id,
        sender: players[socket.id].username,
        text: message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle username changes
  socket.on('setUsername', (username) => {
    if (players[socket.id]) {
      const oldUsername = players[socket.id].username;
      players[socket.id].username = username;
      
      io.emit('usernameChanged', {
        id: socket.id,
        oldUsername,
        newUsername: username
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Notify other players of disconnection
    io.emit('playerLeft', socket.id);
    
    // Remove from players list
    delete players[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});