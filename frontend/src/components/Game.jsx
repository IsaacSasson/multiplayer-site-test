import { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import Player from './Player';
import ChatBox from './ChatBox';

const Game = () => {
  const { player, players, movePlayer, connected } = useGame();
  const gameRef = useRef(null);
  
  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!player) return;
      
      const speed = 10; // Movement speed in pixels
      let newX = player.x;
      let newY = player.y;
      
      // Arrow key movement
      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, player.y - speed);
          e.preventDefault();
          break;
        case 'ArrowDown':
          newY = Math.min(window.innerHeight, player.y + speed);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newX = Math.max(0, player.x - speed);
          e.preventDefault();
          break;
        case 'ArrowRight':
          newX = Math.min(window.innerWidth, player.x + speed);
          e.preventDefault();
          break;
        default:
          return; // Don't update for other keys
      }
      
      if (newX !== player.x || newY !== player.y) {
        movePlayer(newX, newY);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, movePlayer]);
  
  // Handle responsive movement calculation
  useEffect(() => {
    const updateBounds = () => {
      // If player is outside bounds after resize, move them within bounds
      if (player) {
        let needsUpdate = false;
        let newX = player.x;
        let newY = player.y;
        
        if (player.x > window.innerWidth) {
          newX = window.innerWidth - 20;
          needsUpdate = true;
        }
        
        if (player.y > window.innerHeight) {
          newY = window.innerHeight - 20;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          movePlayer(newX, newY);
        }
      }
    };
    
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [player, movePlayer]);

  return (
    <div 
      ref={gameRef}
      className="w-screen h-screen bg-gray-200 relative overflow-hidden"
    >
      {/* Map background - replace with your image later */}
      
      {/* Connection status */}
      {!connected && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
          Disconnected
        </div>
      )}
      
      {/* Game info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
        Players online: {Object.keys(players).length}
      </div>
      
      {/* Player characters */}
      {Object.values(players).map((playerData) => (
        <Player 
          key={playerData.id} 
          player={playerData} 
          isCurrentPlayer={player && playerData.id === player.id}
        />
      ))}
      
      {/* Chat box */}
      <ChatBox />
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md text-sm">
        <p>Use arrow keys to move</p>
      </div>
    </div>
  );
};

export default Game;