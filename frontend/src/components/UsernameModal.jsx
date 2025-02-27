import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const UsernameModal = () => {
  const { player, setUsername } = useGame();
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
  
  if (!isOpen) {
    return (
      <button 
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
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
      <div className="bg-gray-800 rounded-lg p-6 w-80 max-w-[90%] shadow-lg">
        <h2 className="text-white text-xl font-bold mb-4">Your Username</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Enter a username:
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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