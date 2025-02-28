import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const UsernameModal = () => {
  const { player, setUsername, currentTheme } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  
  // Show modal when player first joins
  useEffect(() => {
    if (player && player.username.startsWith('Player-')) {
      setIsOpen(true);
    }
  }, [player]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newUsername.trim()) {
      setUsername(newUsername);
      setIsOpen(false);
    }
  };
  
  if (!player) return null;
  
  // Theme-based colors
  const isDarkTheme = currentTheme === 'dark';
  const bgColor = isDarkTheme ? 'bg-midnight-800' : 'bg-midnight-800';
  const buttonColor = isDarkTheme ? 'bg-midnight-600 hover:bg-midnight-500' : 'bg-burgundy-600 hover:bg-burgundy-700';
  const secondaryButtonColor = isDarkTheme ? 'bg-midnight-700 hover:bg-midnight-600' : 'bg-midnight-700 hover:bg-midnight-600';
  const inputBgColor = isDarkTheme ? 'bg-midnight-700' : 'bg-midnight-700';
  const inputBorderColor = isDarkTheme ? 'border-midnight-600' : 'border-midnight-600';
  const inputFocusColor = isDarkTheme ? 'focus:ring-midnight-500' : 'focus:ring-burgundy-500';
  
  if (!isOpen) {
    return (
      <button 
        className={`absolute top-16 right-4 ${buttonColor} text-white px-3 py-1 rounded-md text-sm shadow-md z-10`}
        onClick={() => {
          setNewUsername(player.username);
          setIsOpen(true);
        }}
      >
        Change Username
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} rounded-lg p-6 w-80 max-w-[90%] shadow-lg`}>
        <h2 className="text-white text-xl font-bold mb-4">Your Username</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Enter a username:
            </label>
            <input
              type="text"
              id="username"
              className={`w-full px-3 py-2 ${inputBgColor} border ${inputBorderColor} rounded-md text-white focus:outline-none focus:ring-2 ${inputFocusColor}`}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              maxLength={20}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className={`px-4 py-2 ${secondaryButtonColor} text-white rounded-md transition`}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${buttonColor} text-white rounded-md transition`}
              disabled={!newUsername.trim() || newUsername === player.username}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;