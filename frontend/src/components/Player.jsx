import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

function Player({ player, isCurrentPlayer }) {
  const { currentTheme } = useGame();
  const [showUsername, setShowUsername] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [hue, setHue] = useState(Math.floor(Math.random() * 360)); // Random starting hue

  useEffect(() => {
    // Animate the hue rotation for the background gradient
    const interval = setInterval(() => {
      setHue(prevHue => (prevHue + 1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

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

  // Update last position
  useEffect(() => {
    if (player) {
      setLastPosition({ x: player.x, y: player.y });
    }
  }, [player?.x, player?.y]);

  // Debug - if no player, show empty div with error
  if (!player) {
    console.error('Player component rendered without player data');
    return <div className="bg-burgundy-500 p-2 text-white">Missing player data</div>;
  }

  // Get the correct SVG file based on player skin
  const getSkinSrc = () => {
    switch(player.skin) {
      case 'polarBear':
        return '/assets/polar-bear.svg';
      case 'seal':
        return '/assets/seal.svg';
      case 'whale':
        return '/assets/whale.svg';
      case 'dolphin':
        return '/assets/dolphin.svg';
      case 'penguin':
      default:
        return '/assets/penguin.svg';
    }
  };

  // Theme-based styles
  const isDarkTheme = currentTheme === 'dark';
  const usernameCurrentPlayerBg = isDarkTheme ? 'bg-midnight-700 text-burgundy-400' : 'bg-burgundy-600 text-white';
  const usernameOtherPlayerBg = isDarkTheme ? 'bg-midnight-800 text-gray-300' : 'bg-midnight-800 text-gray-200';
  const highlightColor = isDarkTheme ? 'border-midnight-500' : 'border-burgundy-500';
  const gradientFrom = isDarkTheme ? 'rgba(121, 26, 48, 0.3)' : 'rgba(202, 37, 69, 0.3)';

  return (
    <div 
      className="absolute transition-all duration-100 ease-linear flex flex-col items-center player-transition"
      style={{ 
        left: `${player.x}px`, 
        top: `${player.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isCurrentPlayer ? 10 : 5
      }}
      onMouseEnter={() => !isCurrentPlayer && setShowUsername(true)}
      onMouseLeave={() => !isCurrentPlayer && setShowUsername(false)}
    >
      {/* Animal sprite with animated gradient background - NO SCALE DIFFERENCE */}
      <div className="relative">
        <div 
          className="w-16 h-16 rounded-full"
          style={{
            background: `linear-gradient(${hue}deg, var(--tw-gradient-stops))`,
            '--tw-gradient-from': gradientFrom,
            '--tw-gradient-to': 'rgba(255, 255, 255, 0.5)',
            '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)'
          }}
        />
        
        <img 
          src={getSkinSrc()} 
          alt={player.skin}
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Highlight for current player - thinner, non-scaling border */}
        {isCurrentPlayer && (
          <div className={`absolute -inset-0.5 rounded-full border ${highlightColor} animate-pulse opacity-90`} />
        )}
      </div>
      
      {/* Username display */}
      {(showUsername || isCurrentPlayer) && (
        <div 
          className={`text-xs px-2 py-1 rounded-md whitespace-nowrap mt-1 ${
            isCurrentPlayer 
              ? usernameCurrentPlayerBg + ' font-medium' 
              : usernameOtherPlayerBg + ' opacity-80'
          }`}
        >
          {player.username}
        </div>
      )}
    </div>
  );
}

export default Player;