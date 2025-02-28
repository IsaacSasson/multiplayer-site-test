import { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const SkinShop = ({ onClose }) => {
  const { 
    playerSkins, 
    playerCoins, 
    purchaseSkin, 
    selectSkin,
    availableSkins
  } = useGame();
  
  const [notification, setNotification] = useState(null);

  // Create a copy of skins with owned status
  const skinsWithStatus = Object.entries(availableSkins).map(([id, skin]) => ({
    id,
    ...skin,
    owned: playerSkins.available.includes(id),
    selected: playerSkins.selected === id
  }));
  
  const handleSkinAction = (skinId) => {
    // Check if skin is already owned
    if (playerSkins.available.includes(skinId)) {
      // If owned, select it
      if (selectSkin(skinId)) {
        setNotification({
          type: 'success',
          message: `${availableSkins[skinId].name} selected!`
        });
      }
    } else {
      // Try to purchase
      if (purchaseSkin(skinId)) {
        // Auto-select after purchase
        selectSkin(skinId);
        setNotification({
          type: 'success',
          message: `${availableSkins[skinId].name} purchased and selected!`
        });
      } else {
        setNotification({
          type: 'error',
          message: `Not enough coins to buy ${availableSkins[skinId].name}!`
        });
      }
    }
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Helper to render animal preview
  const renderAnimalPreview = (skinId) => {
    const svgId = `${skinId}-down`;
    
    return (
      <div className="h-24 w-24 relative flex items-center justify-center bg-blue-100 bg-opacity-20 rounded-full">
        <svg viewBox="0 0 60 60" className="w-20 h-20">
          <use href={`/assets/animal-sprites.svg#${svgId}`} />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90%] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Skin Shop</h2>
          <span className="text-yellow-400 font-bold flex items-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1 fill-current">
              <circle cx="12" cy="12" r="10" fill="#FFD700"/>
              <circle cx="12" cy="12" r="8" fill="#FFC700"/>
              <text x="12" y="16" textAnchor="middle" fill="#885800" fontSize="10" fontWeight="bold">$</text>
            </svg>
            {playerCoins} Coins
          </span>
        </div>
        
        {notification && (
          <div 
            className={`mb-4 p-2 rounded text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {skinsWithStatus.map((skin) => (
            <div
              key={skin.id}
              className={`bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition border-2 ${
                skin.selected 
                  ? 'border-blue-500' 
                  : 'border-transparent'
              }`}
              onClick={() => handleSkinAction(skin.id)}
            >
              <div className="flex flex-col items-center space-y-2">
                {renderAnimalPreview(skin.id)}
                <p className="text-white font-medium">{skin.name}</p>
                {skin.owned ? (
                  <span className="text-green-400 text-xs">Owned</span>
                ) : (
                  <span className="text-yellow-400 text-xs flex items-center">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 mr-1 fill-current">
                      <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                      <circle cx="12" cy="12" r="8" fill="#FFC700"/>
                    </svg>
                    {skin.price} Coins
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkinShop;