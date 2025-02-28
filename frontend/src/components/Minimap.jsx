import { useEffect, useRef, useState } from 'react';

const Minimap = ({ players, currentPlayerId, mapWidth, mapHeight, backgroundSrc }) => {
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Minimap dimensions
  const minimapWidth = 150;
  const minimapHeight = 150;
  
  // Calculate the scale factor for the minimap
  const scaleX = minimapWidth / mapWidth;
  const scaleY = minimapHeight / mapHeight;
  
  // Load the background image
  useEffect(() => {
    if (!backgroundSrc) return;
    
    const img = new Image();
    img.src = backgroundSrc;
    
    img.onload = () => {
      backgroundImageRef.current = img;
      setImageLoaded(true);
    };
    
    return () => {
      img.onload = null;
    };
  }, [backgroundSrc]);
  
  // Draw the minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !players || !mapWidth || !mapHeight) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw background if image loaded
    if (backgroundImageRef.current) {
      // Draw the background image scaled to the minimap size
      ctx.drawImage(
        backgroundImageRef.current,
        0, 0, 
        backgroundImageRef.current.width, backgroundImageRef.current.height,
        0, 0, 
        minimapWidth, minimapHeight
      );
    } else {
      // Fallback background if image not loaded
      ctx.fillStyle = '#dcc6d0'; // Light burgundy
      ctx.fillRect(0, 0, minimapWidth, minimapHeight);
    }
    
    // Draw border
    ctx.strokeStyle = 'rgba(202, 37, 69, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw players as dots
    Object.values(players).forEach(playerData => {
      // Skip players with invalid coordinates
      if (playerData.x === undefined || playerData.y === undefined) return;
      
      // Scale the position to minimap coordinates
      const x = playerData.x * scaleX;
      const y = playerData.y * scaleY;
      
      // Choose color based on whether it's the current player
      const isCurrentPlayer = playerData.id === currentPlayerId;
      
      // Draw player dot
      ctx.beginPath();
      if (isCurrentPlayer) {
        // Current player - burgundy dot with a white border
        ctx.fillStyle = '#ca2545'; // burgundy-600
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Other players - white dots
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw current view frame
    if (currentPlayerId && players[currentPlayerId]) {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Center of viewport in map coordinates is the player position
      const center = {
        x: players[currentPlayerId].x,
        y: players[currentPlayerId].y
      };
      
      // Calculate viewport rectangle in minimap coordinates
      const viewportRect = {
        left: (center.x - viewport.width / 2) * scaleX,
        top: (center.y - viewport.height / 2) * scaleY,
        width: viewport.width * scaleX,
        height: viewport.height * scaleY
      };
      
      // Draw viewport rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(
        viewportRect.left,
        viewportRect.top,
        viewportRect.width,
        viewportRect.height
      );
      ctx.setLineDash([]);
    }
    
  }, [players, currentPlayerId, mapWidth, mapHeight, scaleX, scaleY, imageLoaded]);
  
  return (
    <div className="relative z-50 bg-midnight-900 bg-opacity-70 p-1 rounded-md">
      <canvas 
        ref={canvasRef} 
        width={minimapWidth} 
        height={minimapHeight}
        className="rounded-md shadow-md border border-midnight-700"
      />
      
      {/* Minimap label */}
      <div className="absolute top-2 left-2 text-white text-xs font-semibold opacity-80">
        Map
      </div>
    </div>
  );
};

export default Minimap;