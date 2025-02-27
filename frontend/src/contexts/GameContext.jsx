import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Create context
const GameContext = createContext();

// Socket.io connection - update URL to your deployed backend URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL);

export const GameProvider = ({ children }) => {
  // State for player, other players, and chat
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Socket connection handlers
    const onConnect = () => {
      console.log('Connected to server');
      setConnected(true);
    };

    const onDisconnect = () => {
      console.log('Disconnected from server');
      setConnected(false);
    };

    // Game state handlers
    const onGameState = (gameState) => {
      setPlayers(gameState);
      // Set current player
      setPlayer(gameState[socket.id]);
    };

    const onPlayerJoined = (newPlayer) => {
      setPlayers((prev) => ({
        ...prev,
        [newPlayer.id]: newPlayer
      }));
    };

    const onPlayerMoved = (data) => {
      setPlayers((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          x: data.x,
          y: data.y
        }
      }));
    };

    const onPlayerLeft = (playerId) => {
      setPlayers((prev) => {
        const updatedPlayers = { ...prev };
        delete updatedPlayers[playerId];
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

    // Register socket event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('gameState', onGameState);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerMoved', onPlayerMoved);
    socket.on('playerLeft', onPlayerLeft);
    socket.on('newMessage', onNewMessage);
    socket.on('usernameChanged', onUsernameChanged);

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
    };
  }, []);

  // Function to move player
  const movePlayer = (x, y) => {
    if (player) {
      // Update local state immediately
      setPlayer((prev) => ({ ...prev, x, y }));
      setPlayers((prev) => ({
        ...prev,
        [socket.id]: {
          ...prev[socket.id],
          x,
          y
        }
      }));
      
      // Send movement to server
      socket.emit('playerMove', { x, y });
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

  // Context value
  const value = {
    player,
    players,
    messages,
    connected,
    movePlayer,
    sendMessage,
    setUsername
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