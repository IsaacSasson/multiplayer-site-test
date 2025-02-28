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
    width: 2000, // Default dimensions
    height: 2000
  });

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`Background image loaded: ${img.width}x${img.height}`);
      
      // Update local state
      setImageDetails({
        loaded: true,
        image: img,
        width: img.width,
        height: img.height
      });
      
      // Update game context with map dimensions
      updateMapDimensions(img.width, img.height);
    };
    
    img.onerror = (err) => {
      console.error('Failed to load background image:', err);
      // Keep using default dimensions
    };
    
    // Start loading the image
    img.src = imagePath;
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imagePath, updateMapDimensions]);

  return imageDetails;
};

export default useBackgroundImage;