import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { useChatBot } from './ChatBotContext';

const EnhancedChatBot = () => {
  const { 
    chatHistory, 
    isLoading, 
    chatOpen, 
    sendMessage, 
    clearChat, 
    toggleChat, 
    setChatOpen 
  } = useChatBot();
  
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatOpen, isMinimized]);
  
  // Handle initial load - ensure we have a welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      clearChat(); // This adds the welcome message
    }
  }, [chatHistory.length, clearChat]);
  
  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Handle user message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    sendMessage(input.trim());
    setInput('');
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Toggle Button */}
      {!chatOpen && (
        <button 
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-200"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}
      
      {/* Chat Window */}
      {chatOpen && (
        <div className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-300 overflow-hidden ${isMinimized ? 'h-14 w-72' : 'h-96 w-80'}`}>
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle size={20} className="mr-2" />
              <h3 className="font-medium">StackIT Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearChat} 
                className="hover:bg-blue-700 rounded p-1" 
                title="Reset conversation"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                onClick={toggleMinimize} 
                className="hover:bg-blue-700 rounded p-1"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={toggleChat} 
                className="hover:bg-blue-700 rounded p-1"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-2 max-w-[80%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div 
                    className={`rounded-lg px-3 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex space-x-1 mt-2">
                  <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce"></div>
                  <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="bg-gray-300 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Chat Input */}
          {!isMinimized && (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-r-lg px-3 py-2 transition-colors`}
                disabled={isLoading || input.trim() === ''}
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedChatBot;