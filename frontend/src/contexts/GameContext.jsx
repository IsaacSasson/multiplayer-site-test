import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Create context
const GameContext = createContext();

// Socket.io connection - use environment variable with fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
console.log('Using socket URL:', SOCKET_URL);
const socket = io(SOCKET_URL);

// Available animal skins and their prices
export const AVAILABLE_SKINS = {
  penguin: { name: 'Penguin', price: 0 },
  polarBear: { name: 'Polar Bear', price: 10 },
  seal: { name: 'Seal', price: 10 },
  whale: { name: 'Whale', price: 10 },
  dolphin: { name: 'Dolphin', price: 10 }
};

// Available themes and their prices
export const AVAILABLE_THEMES = {
  default: { name: 'Burgundy Light', price: 0 },
  dark: { name: 'Dark Burgundy', price: 10 }
};

export const GameProvider = ({ children }) => {
  // State for player, other players, and chat
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  
  // State for coins, skins, and themes
  const [playerCoins, setPlayerCoins] = useState(100); // Start with 100 coins
  const [playerSkins, setPlayerSkins] = useState({
    available: ['penguin'], // Start with just the default skin
    selected: 'penguin',
    availableThemes: ['default'], // Start with just the default theme
    selectedTheme: 'default'
  });
  const [currentTheme, setCurrentTheme] = useState('default');
  
  // State for map dimensions
  const [mapDimensions, setMapDimensions] = useState({
    width: 2000,  // Default size, will be updated when the background image loads
    height: 2000
  });

  useEffect(() => {
    // Socket connection handlers
    const onConnect = () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: 'system',
          sender: 'System',
          text: 'Connected to server',
          timestamp: new Date().toISOString()
        }
      ]);
    };

    const onDisconnect = () => {
      console.log('Disconnected from server');
      setConnected(false);
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: 'system',
          sender: 'System',
          text: 'Disconnected from server. Trying to reconnect...',
          timestamp: new Date().toISOString()
        }
      ]);
    };

    // Game state handlers
    const onGameState = (gameState) => {
      console.log('Received game state:', gameState);
      setPlayers(gameState);
      // Set current player
      if (gameState[socket.id]) {
        setPlayer(gameState[socket.id]);
        
        // Load any stored skin preferences from server
        if (gameState[socket.id].skin) {
          setPlayerSkins(prev => ({
            ...prev,
            selected: gameState[socket.id].skin
          }));
        }
        
        // Load any stored coins from server
        if (gameState[socket.id].coins !== undefined) {
          setPlayerCoins(gameState[socket.id].coins);
        }
      }
    };

    const onPlayerJoined = (newPlayer) => {
      console.log('Player joined:', newPlayer);
      setPlayers((prev) => ({
        ...prev,
        [newPlayer.id]: newPlayer
      }));
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: 'system',
          sender: 'System',
          text: `${newPlayer.username} joined the game`,
          timestamp: new Date().toISOString()
        }
      ]);
    };

    const onPlayerMoved = (data) => {
      setPlayers((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          x: data.x,
          y: data.y,
          direction: data.direction
        }
      }));
    };

    const onPlayerLeft = (playerId) => {
      setPlayers((prev) => {
        const playerName = prev[playerId]?.username || 'A player';
        const updatedPlayers = { ...prev };
        delete updatedPlayers[playerId];
        
        // Add system message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: 'system',
            sender: 'System',
            text: `${playerName} left the game`,
            timestamp: new Date().toISOString()
          }
        ]);
        
        return updatedPlayers;
      });
    };

    // Chat handlers
    const onNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onUsernameChanged = (data) => {
      setPlayers((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          username: data.newUsername
        }
      }));
      
      // Update player state if it's the current player
      if (data.id === socket.id) {
        setPlayer((prev) => ({
          ...prev,
          username: data.newUsername
        }));
      }

      // Add system message about username change
      setMessages((prev) => [
        ...prev,
        {
          id: 'system',
          sender: 'System',
          text: `${data.oldUsername} changed their name to ${data.newUsername}`,
          timestamp: new Date().toISOString()
        }
      ]);
    };

    // Skin change handler
    const onSkinChanged = (data) => {
      setPlayers((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          skin: data.skin
        }
      }));
      
      if (data.id === socket.id) {
        // If it's our player, update the local skin state
        setPlayerSkins(prev => ({
          ...prev,
          selected: data.skin
        }));
      }
      
      // Add system message
      if (data.username) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'system',
            sender: 'System',
            text: `${data.username} changed their skin to ${AVAILABLE_SKINS[data.skin]?.name || data.skin}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    };
    
    // Theme change handler
    const onThemeChanged = (data) => {
      if (data.id === socket.id) {
        setCurrentTheme(data.theme);
        setPlayerSkins(prev => ({
          ...prev,
          selectedTheme: data.theme
        }));
      }
    };
    
    // Map dimensions update handler
    const onMapDimensionsUpdated = (dimensions) => {
      setMapDimensions(dimensions);
    };

    // Coins update handler
    const onCoinsUpdated = (data) => {
      if (data.coins !== undefined) {
        setPlayerCoins(data.coins);
      }
    };

    // Register socket event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('gameState', onGameState);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerMoved', onPlayerMoved);
    socket.on('playerLeft', onPlayerLeft);
    socket.on('newMessage', onNewMessage);
    socket.on('usernameChanged', onUsernameChanged);
    socket.on('skinChanged', onSkinChanged);
    socket.on('themeChanged', onThemeChanged);
    socket.on('mapDimensionsUpdated', onMapDimensionsUpdated);
    socket.on('coinsUpdated', onCoinsUpdated);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('gameState', onGameState);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playerMoved', onPlayerMoved);
      socket.off('playerLeft', onPlayerLeft);
      socket.off('newMessage', onNewMessage);
      socket.off('usernameChanged', onUsernameChanged);
      socket.off('skinChanged', onSkinChanged);
      socket.off('themeChanged', onThemeChanged);
      socket.off('mapDimensionsUpdated', onMapDimensionsUpdated);
      socket.off('coinsUpdated', onCoinsUpdated);
    };
  }, []);

  // Function to update map dimensions
  const updateMapDimensions = (width, height) => {
    setMapDimensions({ width, height });
    
    // Also, inform the server about the new map dimensions
    socket.emit('updateMapDimensions', { width, height });
  };

  // Function to move player
  const movePlayer = (x, y) => {
    if (player) {
      // Ensure movement stays within map boundaries
      const boundedX = Math.max(0, Math.min(x, mapDimensions.width));
      const boundedY = Math.max(0, Math.min(y, mapDimensions.height));
      
      // Calculate direction based on movement
      let direction = 'down'; // default
      
      if (player.x !== undefined && player.y !== undefined) {
        const dx = boundedX - player.x;
        const dy = boundedY - player.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement is dominant
          direction = dx > 0 ? 'right' : 'left';
        } else if (Math.abs(dy) > 0) {
          // Vertical movement is dominant
          direction = dy > 0 ? 'down' : 'up';
        }
      }
      
      // Update local state immediately
      setPlayer((prev) => ({ ...prev, x: boundedX, y: boundedY, direction }));
      setPlayers((prev) => ({
        ...prev,
        [socket.id]: {
          ...prev[socket.id],
          x: boundedX,
          y: boundedY,
          direction
        }
      }));
      
      // Send movement to server
      socket.emit('playerMove', { x: boundedX, y: boundedY, direction });
    }
  };

  // Function to send chat message
  const sendMessage = (text) => {
    if (text.trim() && player) {
      socket.emit('chatMessage', text);
    }
  };

  // Function to change username
  const setUsername = (username) => {
    if (username.trim() && player) {
      socket.emit('setUsername', username);
    }
  };

  // Function to purchase skin
  const purchaseSkin = (skinName) => {
    if (!AVAILABLE_SKINS[skinName]) {
      console.error(`Skin ${skinName} does not exist`);
      return false;
    }
    
    const price = AVAILABLE_SKINS[skinName].price;
    
    // Check if already owned
    if (playerSkins.available.includes(skinName)) {
      return true; // Already owned
    }
    
    // Check if enough coins
    if (playerCoins < price) {
      return false; // Not enough coins
    }
    
    // Deduct coins and add skin to available
    setPlayerCoins(prev => prev - price);
    setPlayerSkins(prev => ({
      ...prev,
      available: [...prev.available, skinName]
    }));
    
    // Emit to server (server would handle persistence)
    socket.emit('purchaseSkin', { skinName, price });
    
    return true;
  };

  // Function to select skin
  const selectSkin = (skinName) => {
    if (!playerSkins.available.includes(skinName)) {
      console.error(`Skin ${skinName} not available for this player`);
      return false;
    }
    
    // Update local state
    setPlayerSkins(prev => ({
      ...prev,
      selected: skinName
    }));
    
    // Update player state
    setPlayer(prev => ({
      ...prev,
      skin: skinName
    }));
    
    // Update players state
    setPlayers(prev => ({
      ...prev,
      [socket.id]: {
        ...prev[socket.id],
        skin: skinName
      }
    }));
    
    // Emit to server
    socket.emit('selectSkin', { skinName });
    
    return true;
  };

  // Function to purchase theme
  const purchaseTheme = (themeId) => {
    if (!AVAILABLE_THEMES[themeId]) {
      console.error(`Theme ${themeId} does not exist`);
      return false;
    }
    
    const price = AVAILABLE_THEMES[themeId].price;
    
    // Check if already owned
    if (themeId === 'default' || playerSkins.availableThemes.includes(themeId)) {
      return true; // Already owned
    }
    
    // Check if enough coins
    if (playerCoins < price) {
      return false; // Not enough coins
    }
    
    // Deduct coins and add theme to available
    setPlayerCoins(prev => prev - price);
    setPlayerSkins(prev => ({
      ...prev,
      availableThemes: [...prev.availableThemes, themeId]
    }));
    
    // Emit to server
    socket.emit('purchaseTheme', { themeId, price });
    
    return true;
  };

  // Function to select theme
  const selectTheme = (themeId) => {
    if (themeId !== 'default' && !playerSkins.availableThemes.includes(themeId)) {
      console.error(`Theme ${themeId} not available for this player`);
      return false;
    }
    
    // Update local state
    setCurrentTheme(themeId);
    setPlayerSkins(prev => ({
      ...prev,
      selectedTheme: themeId
    }));
    
    // Emit to server
    socket.emit('selectTheme', { themeId });
    
    return true;
  };

  // Context value
  const value = {
    player,
    players,
    messages,
    connected,
    movePlayer,
    sendMessage,
    setUsername,
    playerCoins,
    playerSkins,
    purchaseSkin,
    selectSkin,
    availableSkins: AVAILABLE_SKINS,
    purchaseTheme,
    selectTheme,
    currentTheme,
    availableThemes: AVAILABLE_THEMES,
    mapDimensions,
    updateMapDimensions
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};