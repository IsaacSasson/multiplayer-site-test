import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

/**
 * Custom hook to load and manage the background image
 * @param {string} imagePath - Path to the background image
 * @returns {Object} - Image details including dimensions and loading status
 */
const useBackgroundImage = (imagePath) => {
  const { updateMapDimensions } = useGame();
  const [imageDetails, setImageDetails] = useState({
    loaded: false,
    image: null,
    width: 2000,  // Default dimensions
    height: 2000
  });

  useEffect(() => {
    // Use the background.png file as specifically requested
    const img = new Image();
    
    img.onload = () => {
      console.log(`Background image loaded: ${img.width}x${img.height}`);
      
      // Use the actual dimensions of the background image
      const mapWidth = img.width;
      const mapHeight = img.height;
      
      // Update local state
      setImageDetails({
        loaded: true,
        image: img,
        width: mapWidth,
        height: mapHeight
      });
      
      // Update game context with map dimensions
      updateMapDimensions(mapWidth, mapHeight);
    };
    
    img.onerror = (err) => {
      console.error('Failed to load background image:', err);
      // Fall back to default dimensions
      updateMapDimensions(2000, 2000);
    };
    
    // Start loading the background.png
    img.src = '/assets/background.png';
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [updateMapDimensions]);

  return imageDetails;
};

export default useBackgroundImage;