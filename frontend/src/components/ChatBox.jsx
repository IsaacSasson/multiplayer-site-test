import { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const ChatBox = () => {
  const { messages, sendMessage, player } = useGame();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!player) return null;

  return (
    <div className="absolute left-4 bottom-4 w-64 md:w-80 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      {/* Chat header */}
      <div 
        className="flex justify-between items-center px-4 py-2 bg-gray-700 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-white font-medium">
          Chat {!isOpen && messages.length > 0 && `(${messages.length})`}
        </h3>
        <button className="text-gray-300 hover:text-white">
          {isOpen ? '▼' : '▲'}
        </button>
      </div>

      {/* Chat messages */}
      {isOpen && (
        <>
          <div className="p-4 h-64 overflow-y-auto bg-gray-900 bg-opacity-50">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center italic text-sm">No messages yet</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => {
                  const isSystem = msg.sender === 'System';
                  const isCurrentUser = msg.sender === player.username;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                    >
                      {!isSystem && (
                        <span className="text-xs text-gray-400 mb-1">
                          {msg.sender} • {formatTime(msg.timestamp)}
                        </span>
                      )}
                      <div 
                        className={`px-3 py-2 rounded-lg max-w-[90%] ${
                          isSystem 
                            ? 'bg-gray-700 text-gray-300 text-xs italic w-full text-center' 
                            : isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-white'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSubmit} className="p-2 bg-gray-800">
            <div className="flex">
              <input
                type="text"
                className="flex-1 px-3 py-2 bg-gray-900 rounded-l-md text-white focus:outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition"
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;