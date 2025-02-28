import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Player from './Player';
import ChatBox from './ChatBox';
import SkinShop from './SkinShop';
import Minimap from './Minimap';
import useBackgroundImage from '../hooks/useBackgroundImage';

const Game = () => {
  const { player, players, movePlayer, connected, playerCoins, mapDimensions } = useGame();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const gameRef = useRef(null);
  
  // Load background image and get dimensions
  const background = useBackgroundImage('/assets/background.png');
  
  // Track pressed keys for smooth movement
  const [pressedKeys, setPressedKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  });
  
  // Store animation frame reference
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);
  
  // Handle key down/up events for smooth movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setPressedKeys(prev => {
          // Only update if the key wasn't already pressed
          if (!prev[e.key]) {
            return { ...prev, [e.key]: true };
          }
          return prev;
        });
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setPressedKeys(prev => ({ ...prev, [e.key]: false }));
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Start animation loop
  useEffect(() => {
    const updatePlayerPosition = (timestamp) => {
      // Throttle updates to 60fps (approx 16ms per frame)
      if (timestamp - lastUpdateRef.current >= 16) {
        lastUpdateRef.current = timestamp;
        
        if (player && Object.values(pressedKeys).some(pressed => pressed)) {
          // Calculate new position based on pressed keys
          const speed = 10; // Increased movement speed for better gameplay
          let newX = player.x;
          let newY = player.y;
          
          if (pressedKeys.ArrowUp) {
            newY = Math.max(0, player.y - speed);
          }
          if (pressedKeys.ArrowDown) {
            newY = Math.min(mapDimensions.height, player.y + speed);
          }
          if (pressedKeys.ArrowLeft) {
            newX = Math.max(0, player.x - speed);
          }
          if (pressedKeys.ArrowRight) {
            newX = Math.min(mapDimensions.width, player.x + speed);
          }
          
          // Only update if position changed
          if (newX !== player.x || newY !== player.y) {
            movePlayer(newX, newY);
          }
        }
      }
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updatePlayerPosition);
    };
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updatePlayerPosition);
    
    // Clean up animation frame on component unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [player, pressedKeys, movePlayer, mapDimensions.width, mapDimensions.height]);

  // Calculate transform to keep player centered
  const calculateTransform = () => {
    if (!player) return { x: 0, y: 0 };
    
    // Center the player in the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate the translation needed to center the player
    const translateX = (viewportWidth / 2) - player.x;
    const translateY = (viewportHeight / 2) - player.y;
    
    return { x: translateX, y: translateY };
  };

  const transform = calculateTransform();

  return (
    <div 
      ref={gameRef}
      className="w-screen h-screen overflow-hidden relative bg-midnight-950"
    >
      {/* The game world container - keeps player centered */}
      <div 
        className="absolute inset-0"
        style={{
          width: mapDimensions.width,
          height: mapDimensions.height,
          transform: `translate(${transform.x}px, ${transform.y}px)`,
          transition: 'transform 0.1s linear'
        }}
      >
        {/* Background - covers the entire map */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'url("/assets/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Player characters */}
        {Object.values(players).map((playerData) => (
          <Player 
            key={playerData.id} 
            player={playerData} 
            isCurrentPlayer={player && playerData.id === player.id}
          />
        ))}
      </div>
      
      {/* UI Elements - fixed position */}
      {/* Connection status */}
      {!connected && (
        <div className="absolute top-4 right-4 bg-burgundy-600 text-white px-3 py-1 rounded-md text-sm z-50">
          Disconnected
        </div>
      )}
      
      {/* Game info and Minimap */}
      <div className="absolute top-4 left-4 z-50 flex flex-col space-y-2">
        <div className="bg-midnight-900 bg-opacity-70 text-white px-3 py-2 rounded-md text-sm">
          <p>Players online: {Object.keys(players).length}</p>
        </div>
        
        {/* Minimap */}
        <Minimap 
          players={players} 
          currentPlayerId={player?.id} 
          mapWidth={mapDimensions.width}
          mapHeight={mapDimensions.height}
          backgroundSrc="/assets/background.png"
        />
      </div>
      
      {/* Coins and Shop Button */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-50">
        <div className="bg-yellow-500 bg-opacity-80 text-midnight-900 px-3 py-1 rounded-md text-sm font-bold flex items-center">
          <svg className="w-5 h-5 mr-1 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {playerCoins} Coins
        </div>
        <button 
          className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-3 py-1 rounded-md text-sm shadow-md transition flex items-center"
          onClick={() => setIsShopOpen(true)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Shop
        </button>
      </div>

      {/* Chat box */}
      <ChatBox />
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-midnight-900 bg-opacity-70 text-white px-4 py-2 rounded-md text-sm z-50">
        <p>Use arrow keys to move</p>
      </div>
      
      {/* Skin Shop Modal */}
      {isShopOpen && <SkinShop onClose={() => setIsShopOpen(false)} />}
    </div>
  );
};

export default Game;