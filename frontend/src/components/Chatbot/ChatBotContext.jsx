import { createContext, useState, useContext, useCallback } from 'react';
import { sendMessageToAI, createSupportTicket } from './ChatBotService';

// Create context
const ChatBotContext = createContext();

// Custom hook to use the ChatBot context
export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

// Provider component
export const ChatBotProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([{
    text: "Hi there! I'm your StackIT Assistant. How can I help you with your IT concerns today?",
    sender: 'bot'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [ticketInProgress, setTicketInProgress] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  
  // Function to add a message to chat history
  const addMessage = useCallback((message, sender) => {
    setChatHistory(prev => [...prev, { text: message, sender }]);
  }, []);
  
  // Function to send message to AI and get response
  const sendMessage = useCallback(async (message) => {
    // Add user message to chat history
    addMessage(message, 'user');
    setIsLoading(true);
    
    try {
      // Try to get user token for authenticated requests
      const token = localStorage.getItem('userToken');
      
      // If we're in the middle of creating a ticket, handle that flow
      if (ticketInProgress) {
        await handleTicketCreation(message, token);
        return;
      }
      
      // For development/demo, use our fallback responses if API call fails
      try {
        // Call the AI service
        const response = await sendMessageToAI(message, chatHistory, token);
        addMessage(response.message, 'bot');
        
        // Check if the AI wants to start ticket creation
        if (response.createTicket) {
          setTicketInProgress(true);
          setTicketData({ description: message });
          addMessage("Let's create a support ticket. What priority would you assign to this issue? (Low, Medium, High)", 'bot');
        }
      } catch (error) {
        console.error('API error, using fallback responses:', error);
        useFallbackResponse(message);
      }
    } catch (error) {
      console.error('Error in AI response:', error);
      addMessage("Sorry, I'm having trouble processing your request. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, chatHistory, ticketInProgress]);
  
  // Helper function for fallback responses when API is unavailable
  const useFallbackResponse = (message) => {
    const lowercaseMessage = message.toLowerCase();
    let response = "I'm here to help with your IT support needs. Could you provide more details about your issue?";
    
    // Simple keyword-based responses
    if (lowercaseMessage.includes('network') || lowercaseMessage.includes('internet') || lowercaseMessage.includes('wifi')) {
      response = "I see you're having network issues. Have you tried restarting your router or checking your network cables? If the problem persists, I can create a network support ticket for you.";
    } else if (lowercaseMessage.includes('password') || lowercaseMessage.includes('reset') || lowercaseMessage.includes('login')) {
      response = "For password resets, I'll need to verify your identity. Please provide your employee ID or email address associated with your account.";
    } else if (lowercaseMessage.includes('software') || lowercaseMessage.includes('install') || lowercaseMessage.includes('application')) {
      response = "For software installation issues, please let me know which application you're trying to install and any error messages you're seeing. Our IT team can help with approved software deployments.";
    } else if (lowercaseMessage.includes('hardware') || lowercaseMessage.includes('device') || lowercaseMessage.includes('printer')) {
      response = "I can help with hardware issues. Please provide details about the device (model, asset tag if available) and describe the problem you're experiencing.";
    } else if (lowercaseMessage.includes('ticket') || lowercaseMessage.includes('support') || lowercaseMessage.includes('help desk')) {
      response = "I can create a support ticket for you. To proceed, please provide a brief description of your issue and your priority level (Low, Medium, High).";
      // Start ticket creation flow
      setTicketInProgress(true);
      setTicketData({ description: message });
      return addMessage(response, 'bot');
    }
    
    addMessage(response, 'bot');
  };
  
  // Function to clear chat history
  const clearChat = useCallback(() => {
    setChatHistory([{
      text: "Hi there! I'm your StackIT Assistant. How can I help you with your IT concerns today?",
      sender: 'bot'
    }]);
    setTicketInProgress(false);
    setTicketData(null);
  }, []);
  
  // Function to toggle chat open/closed
  const toggleChat = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);
  
  // Provide context value
  const value = {
    chatHistory,
    isLoading,
    chatOpen,
    sendMessage,
    clearChat,
    toggleChat,
    setChatOpen,
    ticketInProgress
  };
  
  return <ChatBotContext.Provider value={value}>{children}</ChatBotContext.Provider>;
};

export default ChatBotContext;