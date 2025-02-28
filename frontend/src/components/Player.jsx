import { useState, useEffect } from 'react';

function Player({ player, isCurrentPlayer }) {
  const [showUsername, setShowUsername] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Always show username for a moment when player first appears
    if (player) {
      setShowUsername(true);
      const timer = setTimeout(() => {
        if (!isCurrentPlayer) {
          setShowUsername(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [player?.id, isCurrentPlayer]);

  // Detect movement
  useEffect(() => {
    if (player && (player.x !== lastPosition.x || player.y !== lastPosition.y)) {
      setIsMoving(true);
      setLastPosition({ x: player.x, y: player.y });
      
      // Stop animation after a short delay when player stops moving
      const timer = setTimeout(() => {
        setIsMoving(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [player?.x, player?.y, lastPosition]);

  // Debug - if no player, show empty div with error
  if (!player) {
    console.error('Player component rendered without player data');
    return <div className="bg-red-500 p-2 text-white">Missing player data</div>;
  }

  // Get the correct sprite ID based on player skin and direction
  const getSpriteId = () => {
    const skin = player.skin || 'penguin';
    const direction = player.direction || 'down';
    return `${skin}-${direction}`;
  };

  return (
    <div 
      className={`absolute transition-all duration-100 ease-out flex flex-col items-center ${
        isMoving ? 'animate-bounce' : ''
      }`}
      style={{ 
        left: `${player.x}px`, 
        top: `${player.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isCurrentPlayer ? 10 : 5
      }}
      onMouseEnter={() => !isCurrentPlayer && setShowUsername(true)}
      onMouseLeave={() => !isCurrentPlayer && setShowUsername(false)}
    >
      {/* Animal sprite */}
      <div className={`relative ${isCurrentPlayer ? 'scale-125' : 'scale-100'}`}>
        <svg 
          viewBox="0 0 60 60" 
          className={`w-12 h-12 ${isCurrentPlayer ? 'drop-shadow-lg' : ''}`}
        >
          <use href={`/assets/animal-sprites.svg#${getSpriteId()}`} />
        </svg>
        
        {/* Highlight for current player */}
        {isCurrentPlayer && (
          <div className="absolute -inset-1 rounded-full border-2 border-blue-500 animate-pulse opacity-70" />
        )}
      </div>
      
      {/* Username display */}
      {(showUsername || isCurrentPlayer) && (
        <div 
          className={`text-xs px-2 py-1 rounded-md whitespace-nowrap mt-1 ${
            isCurrentPlayer 
              ? 'bg-blue-500 text-white font-medium' 
              : 'bg-gray-800 text-gray-200 opacity-80'
          }`}
        >
          {player.username}
        </div>
      )}
    </div>
  );
}

export default Player;