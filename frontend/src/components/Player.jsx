import { useState, useEffect } from 'react';

const Player = ({ player, isCurrentPlayer }) => {
  const [showUsername, setShowUsername] = useState(false);

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

  if (!player) return null;

  // Render different shapes based on player.shape
  const renderShape = () => {
    const size = isCurrentPlayer ? 'w-10 h-10' : 'w-8 h-8';
    const border = isCurrentPlayer ? 'border-2 border-white' : '';
    
    switch (player.shape) {
      case 'square':
        return (
          <div 
            className={`${size} ${border}`} 
            style={{ backgroundColor: player.color }}
          />
        );
      case 'rectangle':
        return (
          <div 
            className={`w-12 h-6 ${border}`} 
            style={{ backgroundColor: player.color }}
          />
        );
      case 'triangle':
        return (
          <div 
            className={`${size} ${border}`} 
            style={{ 
              width: 0,
              height: 0,
              borderLeft: isCurrentPlayer ? '20px solid transparent' : '16px solid transparent',
              borderRight: isCurrentPlayer ? '20px solid transparent' : '16px solid transparent',
              borderBottom: isCurrentPlayer ? `40px solid ${player.color}` : `32px solid ${player.color}`
            }}
          />
        );
      default:
        return (
          <div 
            className={`${size} rounded-full ${border}`} 
            style={{ backgroundColor: player.color }}
          />
        );
    }
  };

  return (
    <div 
      className="absolute transition-all duration-100 ease-out flex flex-col items-center"
      style={{ 
        left: `${player.x}px`, 
        top: `${player.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isCurrentPlayer ? 10 : 5
      }}
      onMouseEnter={() => !isCurrentPlayer && setShowUsername(true)}
      onMouseLeave={() => !isCurrentPlayer && setShowUsername(false)}
    >
      {renderShape()}
      
      {/* Username display */}
      {(showUsername || isCurrentPlayer) && (
        <div 
          className={`text-xs px-1 py-0.5 rounded-md whitespace-nowrap mt-1 ${
            isCurrentPlayer ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-200 opacity-80'
          }`}
        >
          {player.username}
        </div>
      )}
    </div>
  );
};

export default Player;