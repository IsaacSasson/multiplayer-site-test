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
    if (!imagePath) {
      console.warn('No image path provided to useBackgroundImage');
      return;
    }
    
    // Create new image element
    const img = new Image();
    
    // Setup load handler
    img.onload = () => {
      console.log(`Background image loaded successfully: ${img.width}x${img.height}`);
      
      // Use the actual dimensions of the background image
      // If image dimensions are too small, use minimum dimensions
      const mapWidth = Math.max(img.width, 2000);
      const mapHeight = Math.max(img.height, 2000);
      
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
    
    // Setup error handler
    img.onerror = (err) => {
      console.error('Failed to load background image:', err);
      console.error('Image path was:', imagePath);
      
      // Fall back to default dimensions
      setImageDetails(prev => ({
        ...prev,
        loaded: false
      }));
      
      // Still update map dimensions with default values
      updateMapDimensions(2000, 2000);
    };
    
    // Start loading the image
    console.log('Loading background image from:', imagePath);
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