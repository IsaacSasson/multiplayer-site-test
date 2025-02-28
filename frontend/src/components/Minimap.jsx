import { useEffect, useRef } from 'react';

const Minimap = ({ players, currentPlayerId, mapWidth, mapHeight }) => {
  const canvasRef = useRef(null);
  
  // Minimap dimensions
  const minimapWidth = 150;
  const minimapHeight = 150;
  
  // Calculate the scale factor for the minimap
  const scaleX = minimapWidth / mapWidth;
  const scaleY = minimapHeight / mapHeight;
  
  // Draw the minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw background with a slight transparency
    ctx.fillStyle = 'rgba(20, 20, 30, 0.7)';
    ctx.fillRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw border
    ctx.strokeStyle = 'rgba(202, 37, 69, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw players as dots
    Object.values(players).forEach(playerData => {
      // Scale the position to minimap coordinates
      const x = playerData.x * scaleX;
      const y = playerData.y * scaleY;
      
      // Choose color based on whether it's the current player
      const isCurrentPlayer = playerData.id === currentPlayerId;
      
      // Draw player dot
      ctx.beginPath();
      if (isCurrentPlayer) {
        // Current player - larger burgundy dot with a white border
        ctx.fillStyle = '#ca2545'; // burgundy-600
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Other players - smaller white dots
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
  }, [players, currentPlayerId, mapWidth, mapHeight, scaleX, scaleY]);
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={minimapWidth} 
        height={minimapHeight}
        className="rounded-md shadow-md"
      />
      
      {/* Minimap label */}
      <div className="absolute top-2 left-2 text-white text-xs font-semibold opacity-80">
        Map
      </div>
    </div>
  );
};

export default Minimap;