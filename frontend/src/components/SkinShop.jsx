import { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const SkinShop = ({ onClose }) => {
  const { 
    playerSkins, 
    playerCoins, 
    purchaseSkin, 
    selectSkin,
    availableSkins,
    purchaseTheme,
    selectTheme,
    currentTheme,
    availableThemes
  } = useGame();
  
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('skins');

  // Create a copy of skins with owned status
  const skinsWithStatus = Object.entries(availableSkins).map(([id, skin]) => ({
    id,
    ...skin,
    owned: playerSkins.available.includes(id),
    selected: playerSkins.selected === id
  }));

  // Create a copy of themes with owned status
  const themesWithStatus = Object.entries(availableThemes).map(([id, theme]) => ({
    id,
    ...theme,
    owned: (id === 'default') || playerSkins.availableThemes.includes(id),
    selected: currentTheme === id
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

  const handleThemeAction = (themeId) => {
    // Check if theme is already owned
    if ((themeId === 'default') || playerSkins.availableThemes.includes(themeId)) {
      // If owned, select it
      if (selectTheme(themeId)) {
        setNotification({
          type: 'success',
          message: `${availableThemes[themeId].name} theme selected!`
        });
      }
    } else {
      // Try to purchase
      if (purchaseTheme(themeId)) {
        // Auto-select after purchase
        selectTheme(themeId);
        setNotification({
          type: 'success',
          message: `${availableThemes[themeId].name} theme purchased and applied!`
        });
      } else {
        setNotification({
          type: 'error',
          message: `Not enough coins to buy ${availableThemes[themeId].name} theme!`
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
    return (
      <div className="h-24 w-24 relative flex items-center justify-center bg-midnight-800 bg-opacity-40 rounded-full">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-burgundy-500/30 to-white/50" />
        <img 
          src={`/assets/${skinId === 'polarBear' ? 'polar-bear' : skinId}.svg`} 
          alt={skinId}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    );
  };

  // Helper to render theme preview
  const renderThemePreview = (themeId) => {
    let bgColor, textColor, accentColor;
    
    if (themeId === 'dark') {
      bgColor = 'bg-midnight-900';
      textColor = 'text-burgundy-500';
      accentColor = 'bg-burgundy-700';
    } else {
      // Default theme
      bgColor = 'bg-white';
      textColor = 'text-burgundy-600';
      accentColor = 'bg-burgundy-500';
    }
    
    return (
      <div className={`h-24 w-36 ${bgColor} rounded-lg flex flex-col overflow-hidden`}>
        <div className={`h-6 ${accentColor} flex items-center px-2`}>
          <div className="w-3 h-3 rounded-full bg-white mr-1"></div>
          <div className="w-10 h-2 bg-white/50 rounded-full"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className={`${textColor} font-bold text-xs`}>
            {themeId.charAt(0).toUpperCase() + themeId.slice(1)} Theme
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-midnight-950 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-midnight-800 rounded-lg p-6 w-96 max-w-[90%] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Shop</h2>
          <span className="text-yellow-400 font-bold flex items-center">
            <svg className="w-5 h-5 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {playerCoins} Coins
          </span>
        </div>
        
        {notification && (
          <div 
            className={`mb-4 p-2 rounded text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-burgundy-600'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-midnight-600 mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'skins' ? 'text-burgundy-500 border-b-2 border-burgundy-500 -mb-px' : 'text-gray-400'}`}
            onClick={() => setActiveTab('skins')}
          >
            Characters
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'themes' ? 'text-burgundy-500 border-b-2 border-burgundy-500 -mb-px' : 'text-gray-400'}`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
        </div>
        
        {activeTab === 'skins' && (
          <div className="grid grid-cols-2 gap-4">
            {skinsWithStatus.map((skin) => (
              <div
                key={skin.id}
                className={`bg-midnight-700 p-3 rounded-lg cursor-pointer hover:bg-midnight-600 transition border-2 ${
                  skin.selected 
                    ? 'border-burgundy-500' 
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
                      <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {skin.price} Coins
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="grid grid-cols-2 gap-4">
            {themesWithStatus.map((theme) => (
              <div
                key={theme.id}
                className={`bg-midnight-700 p-3 rounded-lg cursor-pointer hover:bg-midnight-600 transition border-2 ${
                  theme.selected 
                    ? 'border-burgundy-500' 
                    : 'border-transparent'
                }`}
                onClick={() => handleThemeAction(theme.id)}
              >
                <div className="flex flex-col items-center space-y-2">
                  {renderThemePreview(theme.id)}
                  <p className="text-white font-medium">{theme.name}</p>
                  {theme.owned ? (
                    <span className="text-green-400 text-xs">Owned</span>
                  ) : (
                    <span className="text-yellow-400 text-xs flex items-center">
                      <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {theme.price} Coins
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition"
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