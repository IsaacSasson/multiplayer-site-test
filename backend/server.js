import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Enable CORS
app.use(cors());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Add map dimensions to the server
const MAP_DIMENSIONS = {
  width: 2000,  // Default dimensions
  height: 2000
};

// Game state
const players = {};

// Dynamic spawn area based on map dimensions
const SPAWN_AREA = {
  minX: 100,
  get maxX() { return MAP_DIMENSIONS.width - 100; },
  minY: 100,
  get maxY() { return MAP_DIMENSIONS.height - 100; }
};

// Animal skins available in the game
const AVAILABLE_SKINS = {
  penguin: { name: 'Penguin', price: 0 },
  polarBear: { name: 'Polar Bear', price: 10 },
  seal: { name: 'Seal', price: 10 },
  whale: { name: 'Whale', price: 10 },
  dolphin: { name: 'Dolphin', price: 10 }
};

// Theme options available in the game
const AVAILABLE_THEMES = {
  default: { name: 'Burgundy Light', price: 0 },
  dark: { name: 'Dark Burgundy', price: 10 }
};

// Generate a random position within the spawn area
function generateRandomPosition() {
  return {
    x: Math.floor(Math.random() * (SPAWN_AREA.maxX - SPAWN_AREA.minX) + SPAWN_AREA.minX),
    y: Math.floor(Math.random() * (SPAWN_AREA.maxY - SPAWN_AREA.minY) + SPAWN_AREA.minY)
  };
}

// Generate a unique username
function generateUsername() {
  return `Player-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Generate a random position for the new player
  const position = generateRandomPosition();
  
  // Create a new player object
  players[socket.id] = {
    id: socket.id,
    username: generateUsername(),
    x: position.x,
    y: position.y,
    direction: 'down',
    skin: 'penguin', // Default skin
    coins: 100, // Starting coins
    ownedSkins: ['penguin'], // Default owned skins
    ownedThemes: ['default'], // Default owned themes
    theme: 'default' // Default theme
  };
  
  // Send the current game state to the new player
  socket.emit('gameState', players);
  
  // Notify other players about the new player
  socket.broadcast.emit('playerJoined', players[socket.id]);
  
  // Handle map dimension updates
  socket.on('updateMapDimensions', (dimensions) => {
    console.log('Received map dimensions:', dimensions);
    
    // Update the server's map dimensions
    if (dimensions.width && dimensions.height) {
      MAP_DIMENSIONS.width = dimensions.width;
      MAP_DIMENSIONS.height = dimensions.height;
      
      // Optional: Broadcast the new dimensions to all clients
      io.emit('mapDimensionsUpdated', MAP_DIMENSIONS);
    }
  });
  
  // Handle player movement
  socket.on('playerMove', (data) => {
    if (players[socket.id]) {
      // Ensure movement stays within map boundaries
      const boundedX = Math.max(0, Math.min(data.x, MAP_DIMENSIONS.width));
      const boundedY = Math.max(0, Math.min(data.y, MAP_DIMENSIONS.height));
      
      players[socket.id].x = boundedX;
      players[socket.id].y = boundedY;
      players[socket.id].direction = data.direction || 'down';
      
      // Broadcast the movement to all other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: boundedX,
        y: boundedY,
        direction: data.direction || 'down'
      });
    }
  });
  
  // Handle chat messages
  socket.on('chatMessage', (text) => {
    if (players[socket.id]) {
      const message = {
        id: `msg-${Date.now()}-${socket.id}`,
        sender: players[socket.id].username,
        text: text,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast the message to all clients
      io.emit('newMessage', message);
    }
  });
  
  // Handle username changes
  socket.on('setUsername', (username) => {
    if (players[socket.id]) {
      const oldUsername = players[socket.id].username;
      players[socket.id].username = username;
      
      // Broadcast the username change to all clients
      io.emit('usernameChanged', {
        id: socket.id,
        oldUsername: oldUsername,
        newUsername: username
      });
    }
  });
  
  // Handle skin purchases
  socket.on('purchaseSkin', ({ skinName, price }) => {
    if (players[socket.id] && AVAILABLE_SKINS[skinName]) {
      const player = players[socket.id];
      
      // Check if already owned
      if (player.ownedSkins.includes(skinName)) {
        return; // Already owned
      }
      
      // Check if enough coins
      if (player.coins < price) {
        return; // Not enough coins
      }
      
      // Deduct coins and add skin
      player.coins -= price;
      player.ownedSkins.push(skinName);
      
      // Notify the player about the updated coins
      socket.emit('coinsUpdated', {
        coins: player.coins
      });
    }
  });
  
  // Handle skin selection
  socket.on('selectSkin', ({ skinName }) => {
    if (players[socket.id] && AVAILABLE_SKINS[skinName]) {
      const player = players[socket.id];
      
      // Check if skin is owned
      if (!player.ownedSkins.includes(skinName)) {
        return; // Not owned
      }
      
      // Update skin
      player.skin = skinName;
      
      // Broadcast the skin change to all clients
      io.emit('skinChanged', {
        id: socket.id,
        skin: skinName,
        username: player.username
      });
    }
  });
  
  // Handle theme purchases
  socket.on('purchaseTheme', ({ themeId, price }) => {
    if (players[socket.id] && AVAILABLE_THEMES[themeId]) {
      const player = players[socket.id];
      
      // Check if already owned
      if (player.ownedThemes.includes(themeId)) {
        return; // Already owned
      }
      
      // Check if enough coins
      if (player.coins < price) {
        return; // Not enough coins
      }
      
      // Deduct coins and add theme
      player.coins -= price;
      player.ownedThemes.push(themeId);
      
      // Notify the player about the updated coins
      socket.emit('coinsUpdated', {
        coins: player.coins
      });
    }
  });
  
  // Handle theme selection
  socket.on('selectTheme', ({ themeId }) => {
    if (players[socket.id] && AVAILABLE_THEMES[themeId]) {
      const player = players[socket.id];
      
      // Check if theme is owned
      if (!player.ownedThemes.includes(themeId)) {
        return; // Not owned
      }
      
      // Update theme
      player.theme = themeId;
      
      // Notify only this player about the theme change (themes are client-side only)
      socket.emit('themeChanged', {
        id: socket.id,
        theme: themeId
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove the player from the game state
    if (players[socket.id]) {
      delete players[socket.id];
      
      // Notify other players about the disconnection
      socket.broadcast.emit('playerLeft', socket.id);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});