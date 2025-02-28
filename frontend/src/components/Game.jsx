import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Player from './Player';
import ChatBox from './ChatBox';
import SkinShop from './SkinShop';

const Game = () => {
  const { player, players, movePlayer, connected, playerCoins } = useGame();
  const [isShopOpen, setIsShopOpen] = useState(false);
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
          newY = Math.min(window.innerHeight - 50, player.y + speed);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newX = Math.max(0, player.x - speed);
          e.preventDefault();
          break;
        case 'ArrowRight':
          newX = Math.min(window.innerWidth - 50, player.x + speed);
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
        
        if (player.x > window.innerWidth - 50) {
          newX = window.innerWidth - 50;
          needsUpdate = true;
        }
        
        if (player.y > window.innerHeight - 50) {
          newY = window.innerHeight - 50;
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
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundImage: 'url("/assets/snowy-landscape.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Connection status */}
      {!connected && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm z-10">
          Disconnected
        </div>
      )}
      
      {/* Game info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-md text-sm">
        <p>Players online: {Object.keys(players).length}</p>
      </div>
      
      {/* Coins and Shop Button */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold flex items-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1">
            <circle cx="12" cy="12" r="10" fill="#FFD700"/>
            <circle cx="12" cy="12" r="8" fill="#FFC700"/>
            <text x="12" y="16" textAnchor="middle" fill="#885800" fontSize="10" fontWeight="bold">$</text>
          </svg>
          {playerCoins} Coins
        </div>
        <button 
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
          onClick={() => setIsShopOpen(true)}
        >
          Shop
        </button>
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
      
      {/* Skin Shop Modal */}
      {isShopOpen && <SkinShop onClose={() => setIsShopOpen(false)} />}
    </div>
  );
};

export default Game;