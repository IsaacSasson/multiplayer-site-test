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
  
  // Check if player position needs to be initialized
  useEffect(() => {
    // Position the player in the center of the map on initial load
    if (player && mapDimensions && 
        (player.x === undefined || player.y === undefined || 
         (player.x < 100 && player.y < 100))) {
      console.log('Initializing player position to center of map:', mapDimensions.width/2, mapDimensions.height/2);
      movePlayer(mapDimensions.width / 2, mapDimensions.height / 2);
    }
  }, [player, mapDimensions, movePlayer]);
  
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
          const speed = 10; // Movement speed
          let newX = player.x;
          let newY = player.y;
          let direction = player.direction || 'down';
          
          if (pressedKeys.ArrowUp) {
            newY = Math.max(0, player.y - speed);
            direction = 'up';
          }
          if (pressedKeys.ArrowDown) {
            newY = Math.min(mapDimensions.height, player.y + speed);
            direction = 'down';
          }
          if (pressedKeys.ArrowLeft) {
            newX = Math.max(0, player.x - speed);
            direction = 'left';
          }
          if (pressedKeys.ArrowRight) {
            newX = Math.min(mapDimensions.width, player.x + speed);
            direction = 'right';
          }
          
          // Only update if position changed
          if (newX !== player.x || newY !== player.y) {
            movePlayer(newX, newY, direction);
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

  // Calculate viewport center offset with boundaries
  const calculateCameraPosition = () => {
    if (!player || !player.x || !player.y) return { x: 0, y: 0 };
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate the area where the player should be centered
    // This is the viewport size minus padding for boundaries
    const boundaryPadding = 50; // Pixels from edge where camera stops
    
    // Calculate the maximum camera offset in each direction
    const maxOffsetX = (mapDimensions.width - viewportWidth) / 2 + boundaryPadding;
    const maxOffsetY = (mapDimensions.height - viewportHeight) / 2 + boundaryPadding;
    
    // Calculate ideal centered position (negative because we're moving the world, not the camera)
    let idealX = viewportWidth / 2 - player.x;
    let idealY = viewportHeight / 2 - player.y;
    
    // Clamp to boundaries
    // When reaching map edges, camera stops but player continues
    const clampedX = Math.min(boundaryPadding, Math.max(-maxOffsetX, idealX));
    const clampedY = Math.min(boundaryPadding, Math.max(-maxOffsetY, idealY));
    
    return { x: clampedX, y: clampedY };
  };

  const cameraTransform = calculateCameraPosition();

  return (
    <div 
      ref={gameRef}
      className="w-screen h-screen overflow-hidden relative bg-midnight-950"
    >
      {/* The game world - separate from UI */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{
          transform: `translate(${cameraTransform.x}px, ${cameraTransform.y}px)`,
          transition: 'transform 0.1s linear'
        }}
      >
        {/* Background */}
        <div
          className="absolute top-0 left-0"
          style={{
            backgroundImage: 'url("/assets/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: `${mapDimensions.width}px`,
            height: `${mapDimensions.height}px`
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
      
      {/* UI Layer - fixed position, independent of game world */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          {/* Connection status */}
          {!connected && (
            <div className="absolute top-4 right-4 bg-burgundy-600 text-white px-3 py-1 rounded-md text-sm z-50 pointer-events-auto">
              Disconnected
            </div>
          )}
          
          {/* Game info and Minimap */}
          <div className="absolute top-4 left-4 z-50 flex flex-col space-y-2 pointer-events-auto">
            <div className="bg-midnight-900 bg-opacity-70 text-white px-3 py-2 rounded-md text-sm">
              <p>Players online: {Object.keys(players).length}</p>
              <p>Map size: {mapDimensions.width}x{mapDimensions.height}</p>
              {player && <p>Position: {Math.round(player.x)}, {Math.round(player.y)}</p>}
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
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-50 pointer-events-auto">
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
          <div className="pointer-events-auto">
            <ChatBox />
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-midnight-900 bg-opacity-70 text-white px-4 py-2 rounded-md text-sm z-50 pointer-events-auto">
            <p>Use arrow keys to move</p>
          </div>
        </div>
      </div>
      
      {/* Skin Shop Modal */}
      {isShopOpen && <SkinShop onClose={() => setIsShopOpen(false)} />}
    </div>
  );
};

export default Game;